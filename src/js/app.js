import env from './env.js'
import Logger from './logger.js'
import protocol from './protocol.js'
import Store from './store.js'


/** @type {string} */
let group

/* media names might not be available before we call getDisplayMedia.  So
   we call this twice, the second time to update the menu with user-readable
   labels. */
/** @type {boolean} */
let mediaChoicesDone = false

let safariScreenshareDone = false


class Pyrite {
    /**
     * Old start function.
     */
    constructor(router) {

        this.logger = new Logger(this)
        this.logger.setLevel('debug')

        this.router = router

        this.env = env
        this.protocol = protocol
        this.store = new Store()
        this.state = this.store.load()

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

        group = decodeURIComponent(location.pathname.replace(/^\/[a-z]*\//, ''))
        let title = group.charAt(0).toUpperCase() + group.slice(1)
        if(group !== '') {
            document.title = title
            this.state.title = title
        }

        this.setMediaChoices(false)
    }


    /**
     * @param {File} file
     */
    async addFileMedia(file) {
        this.logger.info('add file media')
        let url = URL.createObjectURL(file)
        let video = document.createElement('video')
        video.src = url
        video.controls = true
        /** @ts-ignore */
        let stream = video.captureStream()

        let {c, id} = this.connection.newUpStream()
        c.kind = 'video'

        this.state.upMedia[c.kind].push(id)

        c.stream = stream
        stream.onaddtrack = function(e) {
            let t = e.track
            if(t.kind === 'audio') {
                let presenting = !!this.findUpMedia('local')

                if(presenting && !this.state.localMute) {
                    this.setLocalMute(true, true)
                    this.displayWarning('You have been muted')
                }
            }
            c.pc.addTrack(t, stream)
            c.labels[t.id] = t.kind
        }
        stream.onremovetrack = function(e) {
            let t = e.track
            delete(c.labels[t.id])

            /** @type {RTCRtpSender} */
            let sender
            c.pc.getSenders().forEach(s => {
                if(s.track === t)
                    sender = s
            })
            if(sender) {
                c.pc.removeTrack(sender)
            } else {
                console.warn('Removing unknown track')
            }

            if(Object.keys(c.labels).length === 0) {
                stream.onaddtrack = null
                stream.onremovetrack == null
                this.delUpMedia(c)
            }
        }

        c.userdata.play = true
    }

    /**
     * @param {string} [id]
     */
    async addLocalMedia(_id) {
        this.logger.info(`add local media - id: ${_id})`)
        // An empty string video/audio device may indicate a fake media stream.
        let audio = this.state.audio.id !== null ? {deviceId: this.state.audio.id} : false
        let video = this.state.video.id !== null ? {deviceId: this.state.video.id} : false

        if(video) {
            let resolution = this.state.resolution
            if(resolution) {
                video.width = { ideal: resolution[0] }
                video.height = { ideal: resolution[1] }
            } else if(this.state.blackboardMode) {
                video.width = { ideal: 1920, min: 640 }
                video.height = {ideal: 1080, min: 400 }
            }
        }

        let oldStream = _id && this.connection.up[_id]

        if(!audio && !video) {
            this.logger.warn('no media')
            if(oldStream) {
                this.delUpMedia(oldStream)
            }
            return
        }

        if(oldStream) {
            this.stopUpMedia(oldStream)
        }
        let constraints = {audio: audio !== null, video: video !== null}

        /** @type {MediaStream} */
        let stream = null
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints)
            this.state.mediaReady = true
        } catch(e) {
            this.displayError(e)
            if(oldStream) {
                this.delUpMedia(oldStream)
            }
            return
        }

        this.setMediaChoices(true)

        let {c, id} = this.newUpStream(_id)
        c.kind = 'local'
        c.stream = stream
        this.state.upMedia[c.kind].push(id)

        stream.getTracks().forEach(t => {
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
            c.pc.addTrack(t, stream)
        })
    }


    async addShareMedia() {
        this.logger.info('add share media')
        /** @type {MediaStream} */
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


    /**
     * @param {string} id
     */
    delMedia(id) {
        this.logger.debug(`remove stream ${id} from state`)
        this.state.streams.splice(this.state.streams.indexOf(id), 1)
    }


    /**
     * @param {string} key
     */
    delSetting(key) {
        this.state[key] = null
        this.store.save()
    }

    /**
     * @param {Stream} c
     */
    delUpMedia(c) {
        this.stopUpMedia(c)
        this.delMedia(c.id)

        c.close()
        delete(this.connection.up[c.id])
    }


    /**
     * delUpMediaKind reoves all up media of the given kind.  If kind is
     * falseish, it removes all up media.
     * @param {string} kind
    */
    delUpMediaKind(kind) {
        this.logger.debug(`remove all up media from kind: ${kind}`)
        for(let id in this.connection.up) {
            let c = this.connection.up[id]
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
        this.connection.close()
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
        if(!this.connection)
            return
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
                    this.setLocalMute(true, true)
                    let by = username ? ' by ' + username : ''
                    this.displayWarning(`You have been muted${by}`)
                } else {
                    console.error(`Got unprivileged message of kind ${kind}`)
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
     * @param {boolean} mute
     * @param {boolean} [reflect]
     */
    setLocalMute(mute, reflect) {
        this.logger.debug(`set local mute: ${mute}`)
        this.muteLocalTracks(mute)
        let button = document.getElementById('mutebutton')
        let icon = button.querySelector("span .fas")
        if(mute){
            icon.classList.add('fa-microphone-slash')
            icon.classList.remove('fa-microphone')
            button.classList.add('muted')
        } else {
            icon.classList.remove('fa-microphone-slash')
            icon.classList.add('fa-microphone')
            button.classList.remove('muted')
        }
        if(reflect) {
            this.updateSettings({localMute: mute})
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


    /**
    * @param{boolean} done
    */
    async setMediaChoices(done) {
        if(mediaChoicesDone)
            return

        let devices = []
        try {
            devices = await navigator.mediaDevices.enumerateDevices()
        } catch(e) {
            console.error(e)
            return
        }

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
        mediaChoicesDone = done
    }


    /**
     * @param {Stream} c
     */
    stopUpMedia(c) {
        if(!c.stream) {
            this.logger.warn('no stream to stop')
            return
        }
        c.stream.getTracks().forEach(t => {
            try {
                this.logger.debug(`stopping track ${t.id}`)
                t.stop()
            } catch(e) {
                // silence error
            }
        })

        this.logger.debug(`removing stream ${c.id}`)
        this.state.streams.splice(this.state.streams.indexOf(c.id), 1)
        this.state.upMedia[c.kind].splice(this.state.upMedia[c.kind].indexOf(c.id), 1)
    }

}

export default Pyrite
