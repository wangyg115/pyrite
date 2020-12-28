import env from './env.js'
import EventEmitter from 'eventemitter3'
import protocol from './protocol.js'
import Store from './store.js'


/** @type {string} */
let group

/* media names might not be available before we call getDisplayMedia.  So
   we call this twice, the second time to update the menu with user-readable
   labels. */
/** @type {boolean} */
let mediaChoicesDone = false


/**
 * @typedef {Object} userpass
 * @property {string} username
 * @property {string} password
 */

/* Some browsers disable session storage when cookies are disabled,
   we fall back to a global variable. */
/**
 * @type {userpass}
 */
let fallbackUserPass = null

/** @type{settings} */
let fallbackSettings = null

/**
 * @param {string} id
 */
function getSelectElement(id) {
    let elt = document.getElementById(id)
    if(!elt || !(elt instanceof HTMLSelectElement))
        throw new Error(`Couldn't find ${id}`)
    return elt
}

/**
 * @param {string} id
 */
function getInputElement(id) {
    let elt = document.getElementById(id)
    if(!elt || !(elt instanceof HTMLInputElement))
        throw new Error(`Couldn't find ${id}`)
    return elt
}

/**
 * @param {string} id
 */
function getButtonElement(id) {
    let elt = document.getElementById(id)
    if(!elt || !(elt instanceof HTMLButtonElement))
        throw new Error(`Couldn't find ${id}`)
    return elt
}





/**
 * @param {string} id
 * @param {boolean} visible
 */
function setVisibility(id, visible) {
    let elt = document.getElementById(id)
    if(visible)
        elt.classList.remove('invisible')
    else
        elt.classList.add('invisible')
}


const activityDetectionInterval = 200
const activityDetectionPeriod = 700
const activityDetectionThreshold = 0.2

/**
 * @param {Stream} c
 * @param {boolean} value
 */
function setActive(c, value) {
    let peer = document.getElementById('peer-' + c.id)
    if(value)
        peer.classList.add('peer-active')
    else
        peer.classList.remove('peer-active')
}


/**
 * @param {HTMLSelectElement} select
 * @param {string} label
 * @param {string} [value]
 */
function addSelectOption(select, label, value) {
    if(!value)
        value = label
    for(let i = 0; i < select.children.length; i++) {
        let child = select.children[i]
        if(!(child instanceof HTMLOptionElement)) {
            console.warn('Unexpected select child')
            continue
        }
        if(child.value === value) {
            if(child.label !== label) {
                child.label = label
            }
            return
        }
    }

    let option = document.createElement('option')
    option.value = value
    option.textContent = label
    select.appendChild(option)
}

/**
 * @param {HTMLSelectElement} select
 * @param {string} value
 */
function selectOptionAvailable(select, value) {
    let children = select.children
    for(let i = 0; i < children.length; i++) {
        let child = select.children[i]
        if(!(child instanceof HTMLOptionElement)) {
            console.warn('Unexpected select child')
            continue
        }
        if(child.value === value)
            return true
    }
    return false
}

/**
 * @param {HTMLSelectElement} select
 * @returns {string}
 */
function selectOptionDefault(select) {
    /* First non-empty option. */
    for(let i = 0; i < select.children.length; i++) {
        let child = select.children[i]
        if(!(child instanceof HTMLOptionElement)) {
            console.warn('Unexpected select child')
            continue
        }
        if(child.value)
            return child.value
    }
    /* The empty option is always available. */
    return ''
}

let safariScreenshareDone = false

/**
 * @param {Stream} c
 */
function stopUpMedia(c) {
    if(!c.stream)
        return
    c.stream.getTracks().forEach(t => {
        try {
            t.stop()
        } catch(e) {
            // silence error
        }
    })
}






/**
 * @param {Element} elt
 */
function cloneHTMLElement(elt) {
    if(!(elt instanceof HTMLElement))
        throw new Error('Unexpected element type')
    return /** @type{HTMLElement} */(elt.cloneNode(true))
}


/**
 * @param {HTMLVideoElement} media
 * @param {HTMLElement} container
 * @param {Stream} c
 */
function addCustomControls(media, container, c) {
    media.controls = false
    let controls = document.getElementById('controls-' + c.id)
    if(controls) {
        console.warn('Attempted to add duplicate controls')
        return
    }

    let template =
        document.getElementById('videocontrols-template').firstElementChild
    controls = cloneHTMLElement(template)
    controls.id = 'controls-' + c.id

    let volume = getVideoButton(controls, 'volume')
    if(c.kind === 'local') {
        volume.remove()
    } else {
        setVolumeButton(media.muted,
            getVideoButton(controls, "volume-mute"),
            getVideoButton(controls, "volume-slider"))
    }

    container.appendChild(controls)
    registerControlHandlers(media, container)
}


/**
 * @param {HTMLElement} container
 * @param {string} name
 */
function getVideoButton(container, name) {
    return /** @type {HTMLElement} */(container.getElementsByClassName(name)[0])
}


/**
 * @param {boolean} muted
 * @param {HTMLElement} button
 * @param {HTMLElement} slider
 */
function setVolumeButton(muted, button, slider) {
    if(!muted) {
        button.classList.remove("fa-volume-mute")
        button.classList.add("fa-volume-up")
    } else {
        button.classList.remove("fa-volume-up")
        button.classList.add("fa-volume-mute")
    }

    if(!(slider instanceof HTMLInputElement))
        throw new Error("Couldn't find volume slider")
    slider.disabled = muted
}


/**
 * @param {HTMLVideoElement} media
 * @param {HTMLElement} container
 */
function registerControlHandlers(media, container) {
    let play = getVideoButton(container, 'video-play')
    if(play) {
        play.onclick = function(event) {
            event.preventDefault()
            media.play()
        }
    }

    let volume = getVideoButton(container, 'volume')
    if (volume) {
        volume.onclick = function(event) {
            let target = /** @type{HTMLElement} */(event.target)
            if(!target.classList.contains('volume-mute'))
                // if click on volume slider, do nothing
                return
            event.preventDefault()
            media.muted = !media.muted
            setVolumeButton(media.muted, target,
                getVideoButton(volume, "volume-slider"))
        }
        volume.oninput = function() {
            let slider = /** @type{HTMLInputElement} */
              (getVideoButton(volume, "volume-slider"))
            media.volume = parseInt(slider.value, 10)/100
        }
    }

    let pip = getVideoButton(container, 'pip')
    if(pip) {
        /** @ts-ignore */
        if(HTMLVideoElement.prototype.requestPictureInPicture) {
            pip.onclick = function(e) {
                e.preventDefault()
                /** @ts-ignore */
                if(media.requestPictureInPicture) {
                    /** @ts-ignore */
                    media.requestPictureInPicture()
                } else {
                    displayWarning('Picture in Picture not supported.')
                }
            }
        } else {
            pip.style.display = 'none'
        }
    }

    let fs = getVideoButton(container, 'fullscreen')
    if(fs) {
        if(HTMLVideoElement.prototype.requestFullscreen ||
           /** @ts-ignore */
           HTMLVideoElement.prototype.webkitRequestFullscreen) {
            fs.onclick = function(e) {
                e.preventDefault()
                if(media.requestFullscreen) {
                    media.requestFullscreen()
                /** @ts-ignore */
                } else if(media.webkitRequestFullscreen) {
                    /** @ts-ignore */
                    media.webkitRequestFullscreen()
                } else {
                    displayWarning('Full screen not supported!')
                }
            }
        } else {
            fs.style.display = 'none'
        }
    }
}


/**
 * @param {string} id
 */
function delMedia(id) {
    let mediadiv = document.getElementById('peers')
    let peer = document.getElementById('peer-' + id)
    if(!peer)
        throw new Error('Removing unknown media')

    let media = /** @type{HTMLVideoElement} */
        (document.getElementById('media-' + id))

    if(media.src) {
        URL.revokeObjectURL(media.src)
        media.src = null
    }

    media.srcObject = null
    mediadiv.removeChild(peer)

    this.resizePeers()
    hideVideo()
}


/**
 * @param {Stream} c
 */
function setMediaStatus(c) {
    let state = c && c.pc && c.pc.iceConnectionState
    let good = state === 'connected' || state === 'completed'

    let media = document.getElementById('media-' + c.id)
    if(!media) {
        console.warn('Setting status of unknown media.')
        return
    }
    if(good) {
        media.classList.remove('media-failed')
        if(c.userdata.play) {
            if(media instanceof HTMLMediaElement)
                media.play().catch(e => {
                    console.error(e)
                    displayError(e)
                })
            delete(c.userdata.play)
        }
    } else {
        media.classList.add('media-failed')
    }
}


/**
 * @param {Stream} c
 * @param {string} [fallback]
 */
function setLabel(c, fallback) {
    let label = document.getElementById('label-' + c.id)
    if(!label)
        return
    let l = c.label
    if(l) {
        label.textContent = l
        label.classList.remove('label-fallback')
    } else if(fallback) {
        label.textContent = fallback
        label.classList.add('label-fallback')
    } else {
        label.textContent = ''
        label.classList.remove('label-fallback')
    }
}

/** @type{Object<string,string>} */
let users = {}


/**
 * Lexicographic order, with case differences secondary.
 * @param{string} a
 * @param{string} b
 */
function stringCompare(a, b) {
    let la = a.toLowerCase()
    let lb = b.toLowerCase()
    if(la < lb)
        return -1
    else if(la > lb)
        return +1
    else if(a < b)
        return -1
    else if(a > b)
        return +1
    return 0
}


let presentRequested = null

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

let connecting = false


class Galene extends EventEmitter {
    /**
     * Old start function.
     */
    constructor() {
        super()

        this.env = env
        this.protocol = protocol
        this.store = new Store()
        this.state = this.store.load()


        this.setViewportHeight()

        // On resize and orientation change, we update viewport height
        addEventListener('resize', this.setViewportHeight)
        addEventListener('orientationchange', this.setViewportHeight)


        group = decodeURIComponent(location.pathname.replace(/^\/[a-z]*\//, ''))
        let title = group.charAt(0).toUpperCase() + group.slice(1)
        if(group !== '') {
            document.title = title
            this.state.title = title
        }

        this.setMediaChoices(false)  // .then(() => this.reflectSettings())
    }


    /**
     * @param {File} file
     */
    async addFileMedia(file) {
        let url = URL.createObjectURL(file)
        let video = document.createElement('video')
        video.src = url
        video.controls = true
        /** @ts-ignore */
        let stream = video.captureStream()

        let c = newUpStream()
        c.kind = 'video'
        c.stream = stream
        stream.onaddtrack = function(e) {
            let t = e.track
            if(t.kind === 'audio') {
                let presenting = !!findUpMedia('local')
                let muted = getSettings().localMute
                if(presenting && !muted) {
                    setLocalMute(true, true)
                    displayWarning('You have been muted')
                }
            }
            c.pc.addTrack(t, stream)
            c.labels[t.id] = t.kind
            c.onstats = gotUpStats
            c.setStatsInterval(2000)
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
                delUpMedia(c)
            }
        }
        await setMedia(c, true, false, video)
        c.userdata.play = true
        setButtonsVisibility()
    }

    /**
     * @param {string} [id]
     */
    async addLocalMedia(id) {
        let settings = getSettings()

        let audio = settings.audio ? {deviceId: settings.audio} : false
        let video = settings.video ? {deviceId: settings.video} : false

        if(video) {
            let resolution = settings.resolution
            if(resolution) {
                video.width = { ideal: resolution[0] }
                video.height = { ideal: resolution[1] }
            } else if(settings.blackboardMode) {
                video.width = { min: 640, ideal: 1920 }
                video.height = { min: 400, ideal: 1080 }
            }
        }

        let old = id && this.connection.up[id]

        if(!audio && !video) {
            if(old)
                delUpMedia(old)
            return
        }

        if(old)
            stopUpMedia(old)

        let constraints = {audio: audio, video: video}
        /** @type {MediaStream} */
        let stream = null
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints)
        } catch(e) {
            displayError(e)
            if(old)
                delUpMedia(old)
            return
        }

        setMediaChoices(true)

        let c = newUpStream(id)

        c.kind = 'local'
        c.stream = stream
        let mute = getSettings().localMute
        stream.getTracks().forEach(t => {
            c.labels[t.id] = t.kind
            if(t.kind == 'audio') {
                if(mute)
                    t.enabled = false
            } else if(t.kind == 'video') {
                if(settings.blackboardMode) {
                    /** @ts-ignore */
                    t.contentHint = 'detail'
                }
            }
            c.pc.addTrack(t, stream)
        })

        c.onstats = gotUpStats
        c.setStatsInterval(2000)
        await setMedia(c, true, true)
        setButtonsVisibility()
    }


    async addShareMedia() {
        /** @type {MediaStream} */
        let stream = null
        try {
            if(!('getDisplayMedia' in navigator.mediaDevices))
                throw new Error('Your browser does not support screen sharing')
            /** @ts-ignore */
            stream = await navigator.mediaDevices.getDisplayMedia({video: true})
        } catch(e) {
            console.error(e)
            displayError(e)
            return
        }

        if(!safariScreenshareDone) {
            if(this.env.isSafari())
                displayWarning('Screen sharing under Safari is experimental.  ' +
                               'Please use a different browser if possible.')
            safariScreenshareDone = true
        }

        let c = newUpStream()
        c.kind = 'screenshare'
        c.stream = stream
        stream.getTracks().forEach(t => {
            c.pc.addTrack(t, stream)
            t.onended = e => {
                delUpMedia(c)
            }
            c.labels[t.id] = 'screenshare'
        })
        c.onstats = gotUpStats
        c.setStatsInterval(2000)
        await setMedia(c, true)
        setButtonsVisibility()
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
            this.addLocalMedia(id)
        }
    }


    clearChat() {
        lastMessage = {}
        document.getElementById('box').textContent = ''
    }


    closeVideoControls() {
        // hide all video buttons used to switch video on mobile layout
        document.getElementById('switch-video').style.display = ""
        document.getElementById('collapse-video').style.display = ""
    }


    /**
     * @param {string} key
     */
    delSetting(key) {
        let s = getSettings()
        if(!(key in s))
            return
        delete(s[key])
        storeSettings(s)
    }

    /**
     * @param {Stream} c
     */
    delUpMedia(c) {
        stopUpMedia(c)
        try {
            delMedia(c.id)
        } catch(e) {
            console.warn(e)
        }
        c.close()
        delete(this.connection.up[c.id])
        this.setButtonsVisibility()
    }


    /**
     * delUpMediaKind reoves all up media of the given kind.  If kind is
     * falseish, it removes all up media.
     * @param {string} kind
    */
    delUpMediaKind(kind) {
        for(let id in this.connection.up) {
            let c = this.connection.up[id]
            if(kind && c.kind != kind)
                continue
            c.close()
            delMedia(id)
            delete(this.connection.up[id])
        }

        this.setButtonsVisibility()
        this.hideVideo()
    }

    /**
     * @param {string} id
     * @param {string} name
     */
    delUser(id, name) {
        if(!name)
            name = null
        if(!(id in users))
            throw new Error('Unknown user id')
        if(users[id] !== name)
            throw new Error('Inconsistent user name')
        delete(users[id])
        let div = document.getElementById('users')
        let user = document.getElementById('user-' + id)
        div.removeChild(user)
    }


    /**
     * @param {unknown} message
     * @param {string} [level]
     */
    displayError(message, level) {
        if(!level)
            level = "error"

        var background = 'linear-gradient(to right, #e20a0a, #df2d2d)'
        var position = 'center'
        var gravity = 'top'

        switch(level) {
        case "info":
            background = 'linear-gradient(to right, #529518, #96c93d)'
            position = 'right'
            gravity = 'bottom'
            break
        case "warning":
            background = "linear-gradient(to right, #bdc511, #c2cf01)"
            break
        }

        /** @ts-ignore */
        Toastify({
            backgroundColor: background,
            className: level,
            close: true,
            duration: 4000,
            gravity: gravity,
            position: position,
            text: message,
        }).showToast()
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
            elts = formatLine(lines[0])
        for(let i = 1; i < lines.length; i++) {
            elts.push(document.createElement('br'))
            elts = elts.concat(formatLine(lines[i]))
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
        let v = getSettings().send
        switch(v) {
        case 'lowest':
            return 150000
        case 'low':
            return 300000
        case 'normal':
            return 700000
        case 'unlimited':
            return null
        default:
            console.error('Unknown video quality', v)
            return 700000
        }
    }


    /**
     * Return null if the user hasn't logged in yet.
     *
     * @returns {string}
     */
    getUsername() {
        let userpass = getUserPass()
        if(!userpass)
            return null
        return userpass.username
    }

    /**
     * Returns null if the user hasn't logged in yet.
     *
     * @returns {userpass}
     */
    getUserPass() {
        /** @type{userpass} */
        let userpass
        try {
            let json = window.sessionStorage.getItem('userpass')
            userpass = JSON.parse(json)
        } catch(e) {
            console.warn("Couldn't retrieve password:", e)
            userpass = fallbackUserPass
        }
        return userpass || null
    }

    /**
     * @this {ServerConnection}
     * @param {number} code
     * @param {string} reason
     */
    gotClose(code, reason) {
        this.delUpMediaKind(null)
        this.setConnected(false)
        if(code != 1000) {
            console.warn('Socket close', code, reason)
        }
    }
    /** @this {ServerConnection} */
    gotConnected() {
        this.setConnected(true)

        this.connection.join(group, this.state.username, this.state.password)
    }


    /**
     * @this {Stream}
     * @param {Object<string,any>} stats
     */
    gotDownStats(stats) {
        if(!getInputElement('activitybox').checked)
            return

        let c = this

        let maxEnergy = 0

        c.pc.getReceivers().forEach(r => {
            let tid = r.track && r.track.id
            let s = tid && stats[tid]
            let energy = s && s['track'] && s['track'].audioEnergy
            if(typeof energy === 'number')
                maxEnergy = Math.max(maxEnergy, energy)
        })

        // totalAudioEnergy is defined as the integral of the square of the
        // volume, so square the threshold.
        if(maxEnergy > activityDetectionThreshold * activityDetectionThreshold) {
            c.userdata.lastVoiceActivity = Date.now()
            setActive(c, true)
        } else {
            let last = c.userdata.lastVoiceActivity
            if(!last || Date.now() - last > activityDetectionPeriod)
                setActive(c, false)
        }
    }

    /**
     * @this {ServerConnection}
     * @param {Stream} c
     */
    gotDownStream(c) {
        c.onclose = function() {
            delMedia(c.id)
        }
        c.onerror = function(e) {
            console.error(e)
            displayError(e)
        }
        c.ondowntrack = function(track, transceiver, label, stream) {
            setMedia(c, false)
        }
        c.onlabel = function(label) {
            setLabel(c)
        }
        c.onstatus = function(status) {
            setMediaStatus(c)
        }
        c.onstats = gotDownStats
        if(getSettings().activityDetection)
            c.setStatsInterval(activityDetectionInterval)
    }


    /**
     * @this {ServerConnection}
     * @param {string} group
     * @param {Object<string,boolean>} perms
     */
    async gotJoined(kind, group, perms, message) {
        switch(kind) {
        case 'fail':
            displayError('The server said: ' + message)
            this.close()
            return
        case 'redirect':
            this.close()
            document.location = message
            return
        case 'leave':
            this.close()
            return
        case 'join':
        case 'change':
            this.displayUsername()
            setButtonsVisibility()
            if(kind === 'change')
                return
            break
        default:
            displayError('Unknown join message')
            this.close()
            return
        }

        let input = /** @type{HTMLTextAreaElement} */
            (document.getElementById('input'))
        input.placeholder = 'Type /help for help'
        setTimeout(() => {input.placeholder = ''}, 8000)

        this.request(getSettings().request)

        if(this.connection.permissions.present && !findUpMedia('local')) {
            if(this.state.present) {
                if(this.state.present === 'mike') {
                    updateSettings({video: ''})
                } else if(this.state.present === 'both') {
                    delSetting('video')
                }
                reflectSettings()

                let button = getButtonElement('presentbutton')
                button.disabled = true
                try {
                    await this.addLocalMedia()
                } finally {
                    button.disabled = false
                }
            } else {
                displayMessage(
                    "Press Ready to enable your camera or microphone",
                )
            }
        }
    }

    /**
     * @this {Stream}
     * @param {Object<string,any>} stats
     */
    gotUpStats(stats) {
        let c = this

        let text = ''

        c.pc.getSenders().forEach(s => {
            let tid = s.track && s.track.id
            let stats = tid && c.stats[tid]
            let rate = stats && stats['outbound-rtp'] && stats['outbound-rtp'].rate
            if(typeof rate === 'number') {
                if(text)
                    text = text + ' + '
                text = text + Math.round(rate / 1000) + 'kbps'
            }
        })

        setLabel(c, text)
    }


    /**
     * @param {string} id
     * @param {string} kind
     * @param {string} name
     */
    gotUser(id, kind, name) {
        switch(kind) {
        case 'add':
            addUser(id, name)
            break
        case 'delete':
            delUser(id, name)
            break
        default:
            console.warn('Unknown user kind', kind)
            break
        }
    }


    /**
     * @param {boolean} [force]
     */
    hideVideo(force) {
        let mediadiv = document.getElementById('peers')
        if(mediadiv.childElementCount > 0 && !force)
            return
        let video_container = document.getElementById('video-container')
        video_container.classList.add('no-video')
        let left = document.getElementById("left")
        if (left.style.display !== "none") {
            // hide all video buttons used to switch video on mobile layout
            this.closeVideoControls()
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
    newUpStream(id) {
        let c = this.connection.newUpStream(id)
        c.onstatus = function(status) {
            setMediaStatus(c)
        }
        c.onerror = function(e) {
            console.error(e)
            displayError(e)
            delUpMedia(c)
        }
        c.onabort = function() {
            delUpMedia(c)
        }
        c.onnegotiationcompleted = function() {
            setMaxVideoThroughput(c, getMaxVideoThroughput())
        }
        return c
    }


    openNav() {
        document.getElementById("sidebarnav").style.width = "250px"
    }

    resetUsers() {
        for(let id in users)
            delUser(id, users[id])
    }



    resizePeers() {
        // Window resize can call this method too early
        if (!this.connection)
            return
        let count =
            Object.keys(this.connection.up).length +
            Object.keys(this.connection.down).length
        let peers = document.getElementById('peers')
        let columns = Math.ceil(Math.sqrt(count))
        if (!count)
            // No video, nothing to resize.
            return
        let container = document.getElementById("video-container")
        // Peers div has total padding of 40px, we remove 40 on offsetHeight
        // Grid has row-gap of 5px
        let rows = Math.ceil(count / columns)
        let margins = (rows - 1) * 5 + 40

        if (count <= 2 && container.offsetHeight > container.offsetWidth) {
            peers.style['grid-template-columns'] = "repeat(1, 1fr)"
            rows = count
        } else {
            peers.style['grid-template-columns'] = `repeat(${columns}, 1fr)`
        }
        if (count === 1)
            return
        let max_video_height = (peers.offsetHeight - margins) / rows
        let media_list = peers.querySelectorAll(".media")
        for(let i = 0; i < media_list.length; i++) {
            let media = media_list[i]
            if(!(media instanceof HTMLMediaElement)) {
                console.warn('Unexpected media')
                continue
            }
            media.style['max-height'] = max_video_height + "px"
        }
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
                console.log(id, dest, username)
                if(privileged) {
                    setLocalMute(true, true)
                    let by = username ? ' by ' + username : ''
                    displayWarning(`You have been muted${by}`)
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
        try {
            await this.connection.connect(url)
        } catch(e) {
            console.error(e)
            displayError(e.message ? e.message : "Couldn't connect to " + url)
        }
    }


    setButtonsVisibility() {
        let permissions = this.connection.permissions
        let local = !!this.findUpMedia('local')
        let share = !!this.findUpMedia('screenshare')
        let video = !!this.findUpMedia('video')

        // don't allow multiple presentations
        setVisibility('presentbutton', permissions.present && !local)
        setVisibility('unpresentbutton', local)

        setVisibility('mutebutton', permissions.present)

        // allow multiple shared documents
        setVisibility('sharebutton', permissions.present &&
                      ('getDisplayMedia' in navigator.mediaDevices))
        setVisibility('unsharebutton', share)

        setVisibility('stopvideobutton', video)

        setVisibility('mediaoptions', permissions.present)
        setVisibility('sendform', permissions.present)
        setVisibility('fileform', permissions.present)
    }

    /**
     * @param{boolean} connected
     */
    setConnected(connected) {
        this.state.connected = connected

        if(connected) {
            this.resetUsers()
            this.clearChat()
            this.displayUsername()
        } else {
            resetUsers()
            // fillLogin() <= from state

            displayError('Disconnected', 'error')
            this.hideVideo()
            this.closeVideoControls()
        }
    }


    /**
     * @param {boolean} mute
     * @param {boolean} [reflect]
     */
    setLocalMute(mute, reflect) {
        muteLocalTracks(mute)
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
        if(reflect)
            updateSettings({localMute: mute})
    }


    /**
     * @param {Stream} c
     * @param {number} [bps]
     */
    async setMaxVideoThroughput(c, bps) {
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
     * setMedia adds a new media element corresponding to stream c.
     *
     * @param {Stream} c
     * @param {boolean} isUp
     *     - indicates whether the stream goes in the up direction
     * @param {boolean} [mirror]
     *     - whether to mirror the video
     * @param {HTMLVideoElement} [video]
     *     - the video element to add.  If null, a new element with custom
     *       controls will be created.
     */
    async setMedia(c, isUp, mirror, video) {
        let peersdiv = document.getElementById('peers')

        let div = document.getElementById('peer-' + c.id)
        if(!div) {
            div = document.createElement('div')
            div.id = 'peer-' + c.id
            div.classList.add('peer')
            peersdiv.appendChild(div)
        }

        let media = /** @type {HTMLVideoElement} */
            (document.getElementById('media-' + c.id))
        if(media) {
            if(video) {
                throw new Error("Duplicate video")
            }
        } else {
            if(video) {
                media = video
            } else {
                media = document.createElement('video')
                if(isUp)
                    media.muted = true
            }

            media.classList.add('media')
            media.autoplay = true
            /** @ts-ignore */
            media.playsinline = true
            media.id = 'media-' + c.id
            div.appendChild(media)
            if(!video)
                addCustomControls(media, div, c)
            if(mirror)
                media.classList.add('mirror')
        }

        if(!video)
            media.srcObject = c.stream

        let label = document.getElementById('label-' + c.id)
        if(!label) {
            label = document.createElement('div')
            label.id = 'label-' + c.id
            label.classList.add('label')
            div.appendChild(label)
        }

        setLabel(c)
        setMediaStatus(c)

        showVideo()
        this.resizePeers()

        if(!isUp && this.env.isSafari() && !findUpMedia('local')) {
            // Safari doesn't allow autoplay unless the user has granted media access
            try {
                let stream = await navigator.mediaDevices.getUserMedia({audio: true})
                stream.getTracks().forEach(t => t.stop())
            } catch(e) {
                // silence error
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
                this.state.devices.video.push({id: d.deviceId, label })
                cn++
            } else if(d.kind === 'audioinput') {
                if(!label) label = `Microphone ${mn}`
                this.state.devices.audio.push({id: d.deviceId, label })
                mn++
            }
        })

        mediaChoicesDone = done
    }


    // Store current browser viewport height in css variable
    setViewportHeight() {
        document.documentElement.style.setProperty(
            '--vh', `${window.innerHeight/100}px`,
        )
        // Ajust video component size
        this.resizePeers()
    }

}

export default Galene
