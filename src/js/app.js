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


const urlRegexp = /https?:\/\/[-a-zA-Z0-9@:%/._\\+~#&()=?]+[-a-zA-Z0-9@:%/_\\+~#&()=]/g


/**
 * @typedef {Object} lastMessage
 * @property {string} [nick]
 * @property {string} [peerId]
 * @property {string} [dest]
 * @property {number} [time]
 */

/** @type {lastMessage} */
let lastMessage = {}


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

        this.setViewportHeight()

        // On resize and orientation change, we update viewport height
        addEventListener('resize', this.setViewportHeight.bind(this))
        addEventListener('orientationchange', this.setViewportHeight.bind(this))

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
                if(this.state.localMute)
                    t.enabled = false
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
            t.onended = (e) => {
                this.delUpMedia(c)
            }
            c.labels[t.id] = 'screenshare'
        })
        c.onstats = this.gotUpStats.bind(this, c)
        c.setStatsInterval(2000)
    }


    /**
     * @param {string} id
     * @param {string} name
     */
    addUser(id, name) {
        if(!name)
            name = null
        if(id in users)
            throw new Error('Duplicate user id')
        users[id] = name

        let div = document.getElementById('users')
        let user = document.createElement('div')
        user.id = 'user-' + id
        user.classList.add("user-p")
        user.textContent = name ? name : '(anon)'

        if(name) {
            let us = div.children
            for(let i = 0; i < us.length; i++) {
                let child = us[i]
                let childname = users[child.id.slice('user-'.length)] || null
                if(!childname || stringCompare(childname, name) > 0) {
                    div.insertBefore(user, child)
                    return
                }
            }
        }
        div.appendChild(user)
    }


    changePresentation() {
        let id = this.findUpMedia('local')
        if(id) {
            this.logger.info('resettings local stream')
            this.addLocalMedia(id)
        }
    }


    clearChat() {
        lastMessage = {}
        console.log('CLEAR CHAT')
        // document.getElementById('box').textContent = ''
    }


    /**
     * @param {string} id
     */
    delMedia(id) {
        this.state.peers.splice(this.state.peers.indexOf(id), 1)
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
        this.logger.debug(`delUpMedia ${c.id}`)
        this.stopUpMedia(c)

        try {
            this.delMedia(c.id)
        } catch(e) {
            console.warn(e)
        }
        c.close()
        delete(this.connection.up[c.id])
        this.state.upMedia.splice(this.state.upMedia[c.kind].findIndex((c.id)), 1)
    }


    /**
     * delUpMediaKind reoves all up media of the given kind.  If kind is
     * falseish, it removes all up media.
     * @param {string} kind
    */
    delUpMediaKind(kind) {
        this.logger.debug(`delUpMediaKind ${kind}`)
        for(let id in this.connection.up) {
            let c = this.connection.up[id]
            if(kind && c.kind != kind)
                continue
            c.close()
            this.delMedia(id)
            delete(this.connection.up[id])
        }
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


    displayUsername() {
        let text = ''

        if(this.connection.permissions.op && this.connection.permissions.present)
            text = '(op, presenter)'
        else if(this.connection.permissions.op)
            text = 'operator'
        else if(this.connection.permissions.present)
            text = 'presenter'

        this.state.permissionText = text
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


    /**
     * @param {string} line
     * @returns {Array.<Text|HTMLElement>}
     */
    formatLine(line) {
        let r = new RegExp(urlRegexp)
        let result = []
        let pos = 0
        while(true) {
            let m = r.exec(line)
            if(!m)
                break
            result.push(document.createTextNode(line.slice(pos, m.index)))
            let a = document.createElement('a')
            a.href = m[0]
            a.textContent = m[0]
            a.target = '_blank'
            a.rel = 'noreferrer noopener'
            result.push(a)
            pos = m.index + m[0].length
        }
        result.push(document.createTextNode(line.slice(pos)))
        return result
    }


    /**
     * @param {string[]} lines
     * @returns {HTMLElement}
     */
    formatLines(lines) {
        let elts = []
        if(lines.length > 0)
            elts = this.formatLine(lines[0])
        for(let i = 1; i < lines.length; i++) {
            elts.push(document.createElement('br'))
            elts = elts.concat(this.formatLine(lines[i]))
        }
        let elt = document.createElement('p')
        elts.forEach(e => elt.appendChild(e))
        return elt
    }


    /**
     * @param {number} time
     * @returns {string}
     */
    formatTime(time) {
        let delta = Date.now() - time
        let date = new Date(time)
        let m = date.getMinutes()
        if(delta > -30000)
            return date.getHours() + ':' + ((m < 10) ? '0' : '') + m
        return date.toLocaleString()
    }


    /** @returns {number} */
    getMaxVideoThroughput() {
        switch(this.state.send) {
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
        this.clearChat()
        this.displayUsername()

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
        c.onclose = () => {
            this.delMedia(c.id)
        }
        c.onerror = (e) => {
            console.error(e)
            this.displayError(e)
        }

        const peer = {
            id: c.id,
            isUp: false,
            kind: c.kind,
            mirror: true,
        }

        this.state.peers.push(peer)
    }


    /**
     * @this {ServerConnection}
     * @param {string} group
     * @param {Object<string,boolean>} perms
     */
    async gotJoined(kind, group, perms, message) {
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
            this.displayUsername()

            if(kind === 'change')
                return
            break
        default:
            this.displayError('Unknown join message')
            this.connection.close()
            return
        }

        this.connection.request(this.state.request)

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

        this.state.peers.push(peer)

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
            notification.timeout = 15000
        }

        this.state.notifications.push(notification)
        setTimeout(() => {
            this.state.notifications.splice(this.state.notifications.findIndex(i => i.id === notification.id), 1)
        }, notification.timeout)

        this.notificationId += 1
    }


    openNav() {
        document.getElementById("sidebarnav").style.width = "250px"
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
        // serverConnection.onchat = this.addToChatbox.bind(this)
        this.connection.onclearchat = this.clearChat.bind(this)
        this.connection.onusermessage = function(id, dest, username, time, privileged, kind, message) {
            switch(kind) {
            case 'error':
            case 'warning':
            case 'info':
                let from = id ? (username || 'Anonymous') : 'The Server'
                if(privileged)
                    displayError(`${from} said: ${message}`, kind)
                else
                    console.error(`Got unprivileged message of kind ${kind}`)
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
        this.logger.info('setLocalMute')
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
        this.logger.info('setMaxVideoThroughput', bps)
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

        // Set default options.

        if (this.state.audio === null && this.state.devices.audio.length) {
            this.state.audio = this.state.devices.audio[0].id
        }

        if (this.state.video.id === null && this.state.devices.video.length) {
            this.state.video.id = this.state.devices.video[0].id
        }

        this.logger.info(`setMediaChoices: video(${this.state.devices.video.length}) audio(${this.state.devices.audio.length})`)

        mediaChoicesDone = done
    }


    // Store current browser viewport height in css variable
    setViewportHeight() {
        document.documentElement.style.setProperty(
            '--vh', `${window.innerHeight/100}px`,
        )
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

        this.logger.info(`removing stream ${c.id}`)
        this.state.peers.splice(this.state.peers.indexOf(c.id), 1)


    }

}

export default Pyrite
