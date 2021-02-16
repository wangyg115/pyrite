

import { createI18n } from 'vue-i18n'

import env from './env.js'

import localeNL from '../locales/nl.js'
import Logger from './logger.js'
import protocol from './protocol.js'
import router from '../js/router.js'
import Store from './store.js'


let safariScreenshareDone = false


class Pyrite {

    constructor() {

        this.logger = new Logger(this)
        this.logger.setLevel('debug')

        this.env = env
        this.router = router
        this.protocol = protocol

        this.logger.debug('loading store')
        this.store = new Store()
        this.state = this.store.load()

        this.i18n = createI18n({
            locale: this.state.language.id,
            messages: {
                nl: localeNL,
            },
            silentFallbackWarn: true,
            silentTranslationWarn: true,
        })

        this.router.beforeResolve((to, from, next) => {
            // Group can only be changed when not connected to one already.
            if (!this.state.connected) {
                if (to.name === 'groups') {
                    this.state.group = to.params.groupId
                } else if (to.name === 'settings') {
                    this.state.group = null
                }
            }
            next()
        })
    }


    async addFileMedia(file) {
        this.logger.info('add file media')
        let {c, id} = this.connection.newUpStream()
        c.kind = 'video'

        const peer = {
            id: c.id,
            isUp: true,
            kind: c.kind,
            mirror: false,
            src: file,
        }

        this.state.streams.push(peer)
        this.state.upMedia[c.kind].push(id)
        c.userdata.play = true
    }


    async addLocalMedia() {
        if (!this.state.connected && this.localStream) {
            this.delLocalMedia()
        }

        await this.setMediaChoices()

        const selecteAudioDevice = this.state.audio.id !== null ? {deviceId: this.state.audio.id} : false
        const selectedVideoDevice = this.state.video.id !== null ? {deviceId: this.state.video.id} : false

        // Verify whether the local mediastream is using the right devices.
        this.logger.debug(`addLocalMedia ${this.state.audio.name} / ${this.state.video.name}`)

        const constraints = {
            audio: selecteAudioDevice,
            video: selectedVideoDevice,
        }

        if(selectedVideoDevice) {
            let resolution = this.state.resolution
            if(resolution) {
                selectedVideoDevice.width = { ideal: resolution[0] }
                selectedVideoDevice.height = { ideal: resolution[1] }
            } else if(this.state.blackboardMode) {
                selectedVideoDevice.width = { ideal: 1920, min: 640 }
                selectedVideoDevice.height = { ideal: 1080, min: 400 }
            }
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
            this.state.mediaReady = true
        } catch(e) {
            this.displayError(e)
            return
        }


        if (this.state.connected) {
            let id = this.findUpMedia('local')
            let oldStream = id && this.connection.up[id]


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

            let {c, streamId} = this.newUpStream(id)
            c.kind = 'local'
            c.stream = this.localStream
            this.state.upMedia[c.kind].push(streamId)

            this.localStream.getTracks().forEach(t => {
                c.labels[t.id] = t.kind
                if(t.kind == 'audio') {
                    if(this.state.localMute) {
                        this.logger.info('muting local stream')
                        t.enabled = false
                    }
                } else if(t.kind == 'video') {
                    if(this.state.blackboardMode) {
                        /** @ts-ignore */
                        t.contentHint = 'detail'
                    }
                }
                c.pc.addTrack(t, this.localStream)
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
            console.error(e)
            this.displayError(e)
            return
        }

        if(!safariScreenshareDone) {
            if(this.env.isSafari) {
                this.displayWarning('Screen sharing under Safari is experimental.  ' +
                               'Please use a different browser if possible.')
            }

            safariScreenshareDone = true
        }

        let {c, id} = this.newUpStream()
        c.kind = 'screenshare'
        this.state.upMedia[c.kind].push(id)

        c.stream = stream
        stream.getTracks().forEach(t => {
            c.pc.addTrack(t, stream)
            t.onended = () => {
                this.delUpMedia(c)
            }
            c.labels[t.id] = 'screenshare'
        })
    }


    changePresentation() {
        let id = this.findUpMedia('local')
        if(id) {
            this.logger.info('resettings local stream')
            this.addLocalMedia(id)
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
        this.state.streams.splice(this.state.streams.findIndex(i => i.id === id), 1)
    }


    delSetting(key) {
        this.state[key] = null
        this.store.save()
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
            this.state.upMedia[kind].splice(this.state.upMedia[kind].indexOf(id), 1)
        }
    }


    disconnect() {
        this.state.users = []
        this.state.streams = []
        this.connection.close()
        this.delLocalMedia()
    }


    /**
     * @param {unknown} message
     * @param {string} [level]
     */
    displayError(message, level) {
        this.notify({level, message })
    }


    /**
     * @param {unknown} message
     */
    displayMessage(message) {
        return this.displayError(message, "info")
    }


    /**
     * @param {unknown} message
     */
    displayWarning(message) {
        return this.displayError(message, "warning")
    }


    /**
    * @param {string} kind
    */
    findUpMedia(kind) {
        for(let id in this.connection.up) {
            if(this.connection.up[id].kind === kind)
                return id
        }
        return null
    }


    /** @returns {number} */
    getMaxVideoThroughput() {
        switch(this.state.send.id) {
        case 'lowest':
            return 150000
        case 'low':
            return 300000
        case 'normal':
            return 700000
        case 'unlimited':
            return null
        default:
            console.error('Unknown video quality')
            return 700000
        }
    }


    /**
     * @this {ServerConnection}
     * @param {number} code
     * @param {string} reason
     */
    gotClose(code, reason) {
        this.state.connected = false
        this.delUpMediaKind(null)

        this.displayError('Disconnected', 'error')

        if(code != 1000) {
            console.warn('Socket close', code, reason)
        }
    }


    /** @this {ServerConnection} */
    gotConnected() {
        const groupName = this.router.currentRoute.value.params.groupId
        this.logger.info(`joining group: ${groupName}`)
        this.connection.join(groupName, this.state.username, this.state.password)
        this.state.connected = true
    }


    /**
     * @this {ServerConnection}
     * @param {Stream} c
     */
    gotDownStream(c) {
        this.logger.info(`new downstream ${c.id}`)
        c.onclose = (replace) => {
            if(!replace) {
                this.logger.debug(`[onclose] downstream ${c.id}`)
                this.delMedia(c.id)
            }

        }
        c.onerror = (e) => {
            this.logger.info(`[onerror] downstream ${c.id}`)
            console.error(e)
            this.displayError(e)
        }

        const peer = {
            id: c.id,
            isUp: false,
            kind: c.kind,
            mirror: true,
        }

        this.state.streams.push(peer)
    }


    /**
     * @this {ServerConnection}
     * @param {string} group
     * @param {Object<string,boolean>} perms
     */
    async gotJoined(kind, group, perms, message) {
        this.state.permissions = perms
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
            this.displayError('Unknown join message')
            this.connection.close()
            return
        }

        this.connection.request(this.state.request.id)

        if(this.connection.permissions.present && !this.findUpMedia('local')) {
            if (!this.state.present) {
                this.displayMessage('Press Ready to enable your camera or microphone')
                return
            }

            if(this.state.present === 'mike') {
                this.state.video.id = null
                this.store.save()
            } else if(this.state.present === 'both') {
                // TODO: Needs action?

            }

            await this.addLocalMedia()

        }
    }


    /**
     * @param {string} id
     * @param {string} kind
     * @param {string} name
     */
    gotUser(id, kind, name) {
        switch(kind) {
        case 'add':
            this.state.users.push({id, name})
            break
        case 'delete':
            this.state.users.splice(this.state.users.findIndex((u) => u.id === id), 1)
            break
        default:
            console.warn('Unknown user kind', kind)
            break
        }
    }


    /**
    * @param {boolean} mute
    */
    muteLocalTracks(mute) {
        this.logger.info(`mute local tracks: ${mute}`)
        this.state.muted = mute
        for(let id in this.connection.up) {
            let c = this.connection.up[id]
            if(c.kind === 'local') {
                let stream = c.stream
                stream.getTracks().forEach(t => {
                    if(t.kind === 'audio') {
                        t.enabled = !mute
                    }
                })
            }
        }
    }


    /**
     * @param {string} [id]
     */
    newUpStream(_id) {
        let {c, id} = this.connection.newUpStream(_id)

        const peer = {
            id: c.id,
            isUp: true,
            kind: c.kind,
            mirror: true,
        }

        this.state.streams.push(peer)

        c.onerror = (e) => {
            console.error(e)
            this.displayError(e)
            this.delUpMedia(c)
        }
        c.onabort = () => {
            this.delUpMedia(c)
        }
        c.onnegotiationcompleted = () => {
            this.setMaxVideoThroughput(c, this.getMaxVideoThroughput())
        }


        return {c, id}
    }


    notify(notification) {
        if (!this.notificationId) {
            this.notificationId = 1
            notification.id = this.notificationId
        }

        if (typeof notification.timeout === 'undefined') {
            notification.timeout = 3000
        }

        this.state.notifications.push(notification)
        setTimeout(() => {
            this.state.notifications.splice(this.state.notifications.findIndex(i => i.id === notification.id), 1)
        }, notification.timeout)

        this.notificationId += 1
    }


    async serverConnect() {
        if(this.connection && this.connection.socket) {
            this.connection.close()
        }
        this.connection = new protocol.ServerConnection()

        this.connection.onconnected = this.gotConnected.bind(this)
        this.connection.onclose = this.gotClose.bind(this)
        this.connection.ondownstream = this.gotDownStream.bind(this)
        this.connection.onuser = this.gotUser.bind(this)
        this.connection.onjoined = this.gotJoined.bind(this)

        this.connection.onusermessage = (id, dest, username, time, privileged, kind, message) => {
            switch(kind) {
            case 'error':
            case 'warning':
            case 'info':
                // eslint-disable-next-line no-case-declarations
                let from = id ? (username || 'Anonymous') : 'The Server'
                if(privileged) {
                    this.displayError(`${from} said: ${message}`, kind)
                }
                else {
                    console.error(`Got unprivileged message of kind ${kind}`)
                }
                break
            case 'mute':
                if(privileged) {
                    this.muteLocalTracks(true)
                    let by = username ? ' by ' + username : ''
                    this.displayWarning(`You have been muted${by}`)
                } else {
                    console.error(`Got unprivileged message of kind ${kind}`)
                }
                break
            case 'clearchat':
                if(privileged) {
                    this.state.messages = []
                }
                break
            default:
                console.warn(`Got unknown user message ${kind}`)
                break
            }
        }
        let url = `ws${location.protocol === 'https:' ? 's' : ''}://${location.host}/ws`
        this.logger.info(`connecting websocket ${url}`)
        try {
            await this.connection.connect(url)
        } catch(e) {
            console.error(e)
            this.displayError(e.message ? e.message : "Couldn't connect to " + url)
        }
    }


    /**
     * @param {Stream} c
     * @param {number} [bps]
     */
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
            try {
                await s.setParameters(p)
            } catch(e) {
                console.error(e)
            }
        }
    }

    async setMediaChoices() {
        let devices = await navigator.mediaDevices.enumerateDevices()

        let cn = 1, mn = 1

        this.state.devices.audio = []
        this.state.devices.video = []

        devices.forEach(d => {
            let label = d.label

            if(d.kind === 'videoinput') {
                if(!label) label = `Camera ${cn}`
                this.state.devices.video.push({id: d.deviceId, name: label })
                cn++
            } else if(d.kind === 'audioinput') {
                if(!label) label = `Microphone ${mn}`
                this.state.devices.audio.push({id: d.deviceId, name: label })
                mn++
            }
        })

        // Set default audio/video options when none is set.
        if (this.state.audio.id === null && this.state.devices.audio.length) {
            this.state.audio =this.state.devices.audio[0]
        }

        if (this.state.video.id === null && this.state.devices.video.length) {
            this.state.video = this.state.devices.video[0]
        }

        this.logger.info(`setMediaChoices: video(${this.state.devices.video.length}) audio(${this.state.devices.audio.length})`)
    }


    /**
     * @param {Stream} c
     */
    stopUpMedia(c) {
        this.logger.debug(`stopping up-stream ${c.id}`)
        c.stream.getTracks().forEach(t => {
            t.stop()
        })

        this.state.upMedia[c.kind].splice(this.state.upMedia[c.kind].indexOf(c.id), 1)
        this.state.streams.splice(this.state.streams.findIndex(i => i.id === c.id), 1)

    }
}

export default Pyrite
