import {createI18n} from 'vue-i18n'

import env from './env.js'

import EventEmitter from 'eventemitter3'
import localeNL from '../locales/nl.js'
import Logger from './logger.js'
import protocol from './protocol.js'
import router from '../js/router.js'
import Store from './store.js'

class Pyrite extends EventEmitter {

    constructor() {
        super()
        this.logger = new Logger(this)
        this.logger.setLevel('debug')

        this.env = env
        this.router = router(this)
        this.protocol = protocol

        this.logger.debug('loading store')
        this.store = new Store()
        this.$s = this.store.load()

        this.i18n = createI18n({
            locale: this.$s.language.id,
            messages: {
                nl: localeNL,
            },
            silentFallbackWarn: true,
            silentTranslationWarn: true,
        })

        this.router.beforeResolve((to, from, next) => {

            if (!this.$s.group.connected) {
                // Navigating groups will change the internally used groupId;
                // but only when not connected to a group already.
                if (to.name === 'groupsDisconnected') {
                    this.$s.group.name = to.params.groupId
                }
            }
            next()
        })
    }

    async addFileMedia(file) {
        this.logger.info('add file media')
        const glnStream = this.connection.newUpStream()
        glnStream.kind = 'video'

        this.$s.streams.push({
            id: glnStream.id,
            isUp: true,
            kind: glnStream.kind,
            mirror: false,
            src: file,
            volume: {
                locked: false,
                value: 100,
            },
        })
        this.$s.upMedia[glnStream.kind].push(glnStream.id)
        glnStream.userdata.play = true
        return glnStream
    }

    async addLocalMedia() {
        if (!this.$s.group.connected && this.localStream) {
            this.delLocalMedia()
        }

        await this.setMediaChoices()

        const selecteAudioDevice = this.$s.audio.id !== null && ['both', 'mike'].includes(this.$s.present) ? {deviceId: this.$s.audio.id} : false
        const selectedVideoDevice = this.$s.video.id !== null && this.$s.present === 'both' ? {deviceId: this.$s.video.id} : false

        // Verify whether the local mediastream is using the right devices.
        this.logger.debug(`addLocalMedia ${this.$s.audio.name} / ${this.$s.video.name}`)

        const constraints = {
            audio: selecteAudioDevice,
            video: selectedVideoDevice,
        }

        if(selectedVideoDevice) {
            let resolution = this.$s.resolution
            if(resolution) {
                selectedVideoDevice.width = {ideal: resolution[0]}
                selectedVideoDevice.height = {ideal: resolution[1]}
            } else if(this.$s.blackboardMode) {
                selectedVideoDevice.width = {ideal: 1920, min: 640}
                selectedVideoDevice.height = {ideal: 1080, min: 400}
            }
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
            this.$s.mediaReady = true
        } catch(e) {
            this.notify({level: 'error', message: e})
            return
        }

        // Connected to Galene; handle peer connection logic.
        if (this.$s.group.connected) {
            let localStreamId = this.findUpMedia('local')
            let oldStream = localStreamId && this.connection.up[localStreamId]

            if(!selecteAudioDevice && !selectedVideoDevice) {
                this.logger.warn('addLocalMedia - no media; aborting')
                if(oldStream) {
                    this.delUpMedia(oldStream)
                }
                return
            }

            if(oldStream) {
                this.logger.debug(`addLocalMedia - removing old stream first`)
                this.stopUpMedia(oldStream)
            }

            const glnStream = this.newUpStream(localStreamId)
            glnStream.kind = 'local'
            glnStream.stream = this.localStream
            this.$s.upMedia[glnStream.kind].push(glnStream.id)

            this.localStream.getTracks().forEach(t => {
                glnStream.labels[t.id] = t.kind
                if(t.kind == 'audio') {
                    if(this.$s.localMute) {
                        this.logger.info('muting local stream')
                        t.enabled = false
                    }
                } else if(t.kind == 'video') {
                    if(this.$s.blackboardMode) {
                        /** @ts-ignore */
                        t.contentHint = 'detail'
                    }
                }
                glnStream.pc.addTrack(t, this.localStream)
            })
        }
    }

    async addShareMedia() {
        this.logger.info('add share media')
        let stream = null
        try {
            if(!('getDisplayMedia' in navigator.mediaDevices))
                throw new Error('Your browser does not support screen sharing')
            /** @ts-ignore */
            stream = await navigator.mediaDevices.getDisplayMedia({video: true})
        } catch(e) {
            this.notify({level: 'error', message: e})
            return
        }

        const glnStream = this.newUpStream()
        glnStream.kind = 'screenshare'
        this.$s.upMedia[glnStream.kind].push(glnStream.id)

        glnStream.stream = stream
        stream.getTracks().forEach(t => {
            glnStream.pc.addTrack(t, stream)
            t.onended = () => {
                this.delUpMedia(glnStream)
            }
            glnStream.labels[t.id] = 'screenshare'
        })

        return glnStream
    }

    changePresentation() {
        let id = this.findUpMedia('local')
        if(id) {
            this.logger.info('resettings local stream')
            this.addLocalMedia()
        }
    }

    async connect() {
        if(this.connection && this.connection.socket) {
            this.connection.close()
        }
        this.connection = new protocol.ServerConnection()

        this.connection.onconnected = this.onConnected.bind(this)
        this.connection.onclose = this.onClose.bind(this)
        this.connection.ondownstream = this.onDownStream.bind(this)
        this.connection.onuser = this.onUser.bind(this)
        this.connection.onjoined = this.onJoined.bind(this)

        this.connection.onusermessage = (id, dest, username, time, privileged, kind, message) => {
            switch(kind) {
            case 'error':
            case 'warning':
            case 'info':
                // eslint-disable-next-line no-case-declarations
                let from = id ? (username || 'Anonymous') : 'The Server'
                if(privileged) {
                    this.notify({level: 'error', message: `${from} said: ${message}`})
                }
                break
            case 'mute':
                if(privileged) {
                    this.muteLocalTracks(true)
                    this.notify({
                        level: 'warning',
                        message: `You have been muted${username ? ' by ' + username : ''}`,
                    })
                }
                break
            case 'clearchat':
                if(privileged) {
                    this.$s.chat.channels.main.messages = []
                }
                break
            default:
                break
            }
        }
        let url = `ws${location.protocol === 'https:' ? 's' : ''}://${location.host}/ws`
        this.logger.info(`connecting websocket ${url}`)
        try {
            await this.connection.connect(url)
        } catch(e) {
            this.notify({
                level: 'error',
                message: e.message ? e.message : "Couldn't connect to " + url,
            })
        }
    }

    delLocalMedia() {
        if (!this.localStream) return

        this.logger.info('delete local media share media')
        const stream = this.localStream
        const tracks = stream.getTracks()
        tracks.forEach(track => {
            this.logger.debug(`stopping track ${track.id}`)
            track.stop()
        })

        delete this.localStream
    }

    delMedia(id) {
        this.logger.debug(`[delMedia] remove stream ${id} from state`)
        this.$s.streams.splice(this.$s.streams.findIndex(i => i.id === id), 1)
    }

    delUpMedia(c) {
        this.stopUpMedia(c)
        this.delMedia(c.id)

        c.close()
        delete(this.connection.up[c.id])
    }

    delUpMediaKind(kind) {
        this.logger.debug(`remove all up media from kind: ${kind}`)
        for(let id in this.connection.up) {
            const c = this.connection.up[id]
            if(kind && c.kind != kind) {
                continue
            }
            c.close()
            this.delMedia(id)
            delete(this.connection.up[id])
            this.logger.debug(`remove up media stream: ${id}`)
            this.$s.upMedia[kind].splice(this.$s.upMedia[kind].indexOf(id), 1)
        }
    }

    disconnect() {
        this.$s.users = []
        this.$s.streams = []
        this.connection.close()
        this.delLocalMedia()
    }

    findUpMedia(kind) {
        for(let id in this.connection.up) {
            if(this.connection.up[id].kind === kind)
                return id
        }
        return null
    }

    getMaxVideoThroughput() {
        switch(this.$s.send.id) {
        case 'lowest':
            return 150000
        case 'low':
            return 300000
        case 'normal':
            return 700000
        case 'unlimited':
            return null
        default:
            return 700000
        }
    }

    muteLocalTracks(mute) {
        this.logger.info(`mute local tracks: ${mute}`)
        this.$s.muted = mute
        for(let id in this.connection.up) {
            const glnStream = this.connection.up[id]
            if(glnStream.kind === 'local') {
                let stream = glnStream.stream
                stream.getTracks().forEach(t => {
                    if(t.kind === 'audio') {
                        t.enabled = !mute
                    }
                })
            }
        }
    }

    newUpStream(_id) {
        const glnStream = this.connection.newUpStream(_id)

        this.$s.streams.push({
            id: glnStream.id,
            isUp: true,
            kind: glnStream.kind,
            mirror: true,
            volume: {
                locked: false,
                value: 100,
            },
        })

        glnStream.onerror = (e) => {
            this.notify({level: 'error', message: e})
            this.delUpMedia(glnStream)
        }
        glnStream.onabort = () => {
            this.delUpMedia(glnStream)
        }
        glnStream.onnegotiationcompleted = () => {
            this.setMaxVideoThroughput(glnStream, this.getMaxVideoThroughput())
        }

        return glnStream
    }

    notify(notification) {
        if (!this.notificationId) {
            this.notificationId = 1
            notification.id = this.notificationId
        }

        if (typeof notification.timeout === 'undefined') {
            notification.timeout = 3000
        }

        this.$s.notifications.push(notification)
        setTimeout(() => {
            this.$s.notifications.splice(this.$s.notifications.findIndex(i => i.id === notification.id), 1)
        }, notification.timeout)

        this.notificationId += 1
    }

    onClose(code, reason) {
        this.$s.group.connected = false
        this.delUpMediaKind(null)
        this.notify({level: 'error', message: 'Disconnected'})

        if(code != 1000) {
            this.notify({level: 'error', message: `Socket close ${code}: ${reason}`})
        }
    }

    onConnected() {
        this.$s.user.id = this.connection.id
        const groupName = this.router.currentRoute.value.params.groupId
        this.logger.info(`joining group: ${groupName}`)
        this.connection.join(groupName, this.$s.user.name, this.$s.user.password)
        this.$s.group.connected = true
    }

    onDownStream(c) {
        this.logger.info(`new downstream ${c.id}`)
        c.onclose = (replace) => {
            if(!replace) {
                this.logger.debug(`[onclose] downstream ${c.id}`)
                this.delMedia(c.id)
            }

        }
        c.onerror = () => {
            const message = `[onerror] downstream ${c.id}`
            this.logger.info(message)
            this.notify({level: 'error', message})
        }

        this.$s.streams.push({
            id: c.id,
            isUp: false,
            kind: c.kind,
            mirror: true,
            volume: {
                locked: false,
                value: 100,
            },
        })
    }

    async onJoined(kind, group, perms, message) {
        this.$s.permissions = perms
        this.logger.info(`joined group ${group}`)
        this.logger.debug(`permissions: ${JSON.stringify(perms)}`)

        switch(kind) {
        case 'fail':
            this.notify({level: 'error', message: `The server said: ${message}`})
            this.connection.close()
            return
        case 'redirect':
            this.connection.close()
            document.location = message
            return
        case 'leave':
            this.connection.close()
            return
        case 'join':
        case 'change':
            if(kind === 'change')
                return
            break
        default:
            this.notify({level: 'error', message: 'Unknown join message'})
            this.connection.close()
            return
        }

        this.connection.request(this.$s.request.id)

        if(this.connection.permissions.present && !this.findUpMedia('local')) {
            if (!this.$s.present) {
                this.notify({level: 'info', message: 'Press Ready to enable your camera or microphone'})
                return
            }

            if(this.$s.present === 'mike') {
                this.$s.video.id = null
                this.store.save()
            } else if(this.$s.present === 'both') {
                // TODO: Needs action?

            }

            await this.addLocalMedia()

        }
    }

    onUser(id, kind, name) {
        switch(kind) {
        case 'add':
            this.$s.users.push({id, name})
            break
        case 'delete':
            this.$s.users.splice(this.$s.users.findIndex((u) => u.id === id), 1)
            break
        default:
            break
        }
    }

    async setMaxVideoThroughput(c, bps) {
        this.logger.debug(`set maxiumum video throughput: ${bps}`)
        let senders = c.pc.getSenders()
        for(let i = 0; i < senders.length; i++) {
            let s = senders[i]
            if(!s.track || s.track.kind !== 'video')
                continue
            let p = s.getParameters()
            if(!p.encodings)
                p.encodings = [{}]
            p.encodings.forEach(e => {
                if(bps > 0)
                    e.maxBitrate = bps
                else
                    delete e.maxBitrate
            })

            await s.setParameters(p)
        }
    }

    async setMediaChoices() {
        let devices = await navigator.mediaDevices.enumerateDevices()

        let cn = 1, mn = 1

        this.$s.devices.audio = []
        this.$s.devices.video = []

        devices.forEach(d => {
            let label = d.label

            if(d.kind === 'videoinput') {
                if(!label) label = `Camera ${cn}`
                this.$s.devices.video.push({id: d.deviceId, name: label})
                cn++
            } else if(d.kind === 'audioinput') {
                if(!label) label = `Microphone ${mn}`
                this.$s.devices.audio.push({id: d.deviceId, name: label})
                mn++
            }
        })

        // Set default audio/video options when none is set.
        if (this.$s.audio.id === null && this.$s.devices.audio.length) {
            this.$s.audio =this.$s.devices.audio[0]
        }

        if (this.$s.video.id === null && this.$s.devices.video.length) {
            this.$s.video = this.$s.devices.video[0]
        }

        this.logger.info(`setMediaChoices: video(${this.$s.devices.video.length}) audio(${this.$s.devices.audio.length})`)
    }

    stopUpMedia(c) {
        this.logger.debug(`stopping up-stream ${c.id}`)
        c.stream.getTracks().forEach(t => t.stop())

        this.$s.upMedia[c.kind].splice(this.$s.upMedia[c.kind].indexOf(c.id), 1)
    }
}

export default Pyrite
