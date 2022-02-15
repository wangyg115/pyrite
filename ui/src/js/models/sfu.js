/**
 * Based on https://github.com/jech/galene/blob/master/static/galene.js
 * Copyright (c) 2020 by Juliusz Chroboczek.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {app} from '@/js/app.js'
import protocol from '../lib/protocol.js'

class ModelSFU {

    async addFileMedia(file) {

        app.logger.info('add file media')

        const {glnStream} = this.newUpStream(null, {
            direction: 'up',
            mirror: false,
            src: file,
        })
        glnStream.label = 'video'

        app.$s.upMedia[glnStream.label].push(glnStream.id)
        glnStream.userdata.play = true
        return glnStream
    }

    async addShareMedia() {
        app.logger.info('add share media')
        let stream = null
        try {
            if(!('getDisplayMedia' in navigator.mediaDevices))
                throw new Error('Your browser does not support screen sharing')
            /** @ts-ignore */
            stream = await navigator.mediaDevices.getDisplayMedia({video: true})
        } catch(e) {
            app.notifier.notify({level: 'error', message: e})
            return
        }

        const {glnStream, streamState} = this.newUpStream()
        glnStream.label = 'screenshare'
        app.$s.upMedia[glnStream.label].push(glnStream.id)

        glnStream.stream = stream

        stream.getTracks().forEach(t => {
            if (t.kind === 'audio') {
                streamState.hasAudio = true
            } else if (t.kind === 'video') {
                streamState.hasVideo = true
            }
            glnStream.pc.addTrack(t, stream)
            // Screensharing was stopped; e.g. through browser ui.
            t.onended = () => {
                this.delUpMedia(glnStream)
            }
        })

        return glnStream
    }

    async addUserMedia() {
        let localStreamId = this.findUpMedia('camera')
        let oldStream = localStreamId && this.connection.up[localStreamId]

        if(oldStream) {
            app.logger.debug(`removing old stream`)
            this.stopUpMedia(oldStream)
        }

        const {glnStream, streamState} = this.newUpStream(localStreamId)
        glnStream.label = 'camera'
        glnStream.stream = app.$m.media.localStream
        this.localGlnStream = glnStream

        app.$s.upMedia[glnStream.label].push(glnStream.id)

        app.$m.media.localStream.getTracks().forEach(t => {
            if(t.kind === 'audio') {
                streamState.hasAudio = true
                if(!app.$s.devices.mic.enabled) {
                    app.logger.info('muting local stream')
                    t.enabled = false
                }
            } else if(t.kind === 'video') {
                streamState.hasVideo = true
                if(app.$s.devices.cam.resolution.id === '1080p') {
                    t.contentHint = 'detail'
                }
            }
            glnStream.pc.addTrack(t, app.$m.media.localStream)
        })

        return new Promise((resolve) => {
            this.localGlnStream.onstatus = (status) => {
                if (status === 'connected') {
                    resolve()
                }
            }
        })
    }

    async connect() {
        if(this.connection && this.connection.socket) {
            this.connection.close()
        }
        this.connection = new protocol.ServerConnection()

        this.connection.onconnected = () => {
            app.logger.info('[connected] connected to Galène websocket')
            app.$s.user.id = this.connection.id
            const groupName = app.router.currentRoute.value.params.groupId

            this.connection.join(groupName, app.$s.user.username, app.$s.user.password)
        }

        this.connection.onclose = this.onClose.bind(this)
        this.connection.ondownstream = this.onDownStream.bind(this)
        this.connection.onuser = this.onUser.bind(this)
        this.connection.onjoined = this.onJoined.bind(this)
        this.connection.onusermessage = this.onUserMessage.bind(this)

        let url = `ws${location.protocol === 'https:' ? 's' : ''}://${location.host}/ws`
        app.logger.info(`connecting websocket ${url}`)

        try {
            await this.connection.connect(url)
            // Share initial status with other users.
            this.connection.userAction('setstatus', this.connection.id, app.$s.user.status)
        } catch(e) {
            app.notifier.notify({
                level: 'error',
                message: e.message ? e.message : "Couldn't connect to " + url,
            })
        }

        return new Promise((resolve, reject) => {
            this.promiseConnect = {reject, resolve}
        })

    }

    delLocalMedia() {
        if (!app.$m.media.localStream) return

        app.logger.info('delete local media share media')
        const stream = app.$m.media.localStream
        const tracks = stream.getTracks()
        tracks.forEach(track => {
            app.logger.debug(`stopping track ${track.id}`)
            track.stop()
        })

        delete app.$m.media.localStream
    }

    delMedia(id) {
        const delStreamIndex = app.$s.streams.findIndex(i => i.id === id)
        if (delStreamIndex === -1) return

        const delStream = app.$s.streams[delStreamIndex]
        app.logger.debug(`[delMedia] remove stream ${delStream.id} from stream state (${delStreamIndex})`)
        app.$s.streams.splice(delStreamIndex, 1)
    }

    delUpMedia(c) {
        this.stopUpMedia(c)
        this.delMedia(c.id)

        c.close()
        delete(this.connection.up[c.id])
    }

    delUpMediaKind(label) {
        app.logger.debug(`remove all up media with label: ${label}`)
        for(let id in this.connection.up) {
            const c = this.connection.up[id]
            if(label && c.label !== label) {
                continue
            }
            c.close()
            this.delMedia(id)
            delete(this.connection.up[id])
            app.logger.debug(`remove up media stream: ${id}`)
            app.$s.upMedia[label].splice(app.$s.upMedia[label].indexOf(id), 1)
        }
    }

    disconnect() {
        app.logger.info(`disconnecting from group ${app.$s.group.name}`)

        app.$s.group.connected = false
        app.$s.streams = []
        this.connection.close()
        this.delLocalMedia()
    }

    findUpMedia(label) {
        for(let id in this.connection.up) {
            if(this.connection.up[id].label === label)
                return id
        }
        return null
    }

    getMaxVideoThroughput() {
        switch(app.$s.media.upstream.id) {
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

    mapRequest(what) {
        switch(what) {
        case '':
            return {}
        case 'audio':
            return {'': ['audio']}
        case 'screenshare-low':
            return {'': ['audio'], screenshare: ['audio','video-low']}
        case 'screenshare':
            return {'': ['audio'], screenshare: ['audio','video']}
        case 'everything-low':
            return {'': ['audio','video-low']}
        case 'everything':
            return {'': ['audio','video']}
        default:
            throw new Error(`Unknown value ${what} in request`)
        }
    }

    muteMicrophone(muted) {
        app.$s.devices.mic.enabled = !muted
        app.logger.debug(`microphone enabled: ${app.$s.devices.mic.enabled}`)
        for(let id in this.connection.up) {
            const glnStream = this.connection.up[id]
            if(glnStream.label === 'camera') {
                glnStream.stream.getTracks().forEach(t => {
                    if(t.kind === 'audio') {
                        t.enabled = !muted
                    }
                })
            }
        }
    }

    newUpStream(_id, state) {
        const glnStream = this.connection.newUpStream(_id)

        let streamState = {
            direction: 'up',
            hasAudio: false,
            hasVideo: false,
            id: glnStream.id,
            mirror: true,
            settings: {audio: {}, video: {}},
            volume: {
                locked: false,
                value: 100,
            },
        }

        if (state) {
            Object.assign(streamState, state)
        }

        app.$s.streams.push(streamState)

        glnStream.onerror = (e) => {
            app.notifier.notify({level: 'error', message: e})
            this.delUpMedia(glnStream)
        }
        glnStream.onabort = () => {
            this.delUpMedia(glnStream)
        }
        glnStream.onnegotiationcompleted = () => {
            const maxThroughput = this.getMaxVideoThroughput()
            this.setMaxVideoThroughput(glnStream, maxThroughput)
        }

        return {glnStream, streamState}
    }

    onClose(code, reason) {
        app.logger.debug('connection closed')

        // Reset some state.
        app.$s.users = []
        app.$s.chat.channels.main.messages = []
        app.$s.chat.channels.main.unread = 0
        app.$s.group.connected = false

        this.delUpMediaKind(null)

        if(code != 1000) {
            app.notifier.notify({level: 'error', message: `Socket close ${code}: ${reason}`})
        }

        app.router.push({name: 'conference-groups'}, {params: {groupId: app.$s.group.name}})
    }

    onDownStream(c) {
        app.logger.debug(`[onDownStream] ${c.id}`)
        c.onclose = (replace) => {
            if(!replace) {
                app.logger.debug(`[onclose] downstream ${c.id}`)
                this.delMedia(c.id)
            }
        }

        c.onerror = () => {
            const message = `[onerror] downstream ${c.id}`
            app.logger.error(message)
            app.notifier.notify({level: 'error', message})
        }

        const streamState = {
            direction: 'down',
            hasAudio: false,
            hasVideo: false,
            id: c.id,
            mirror: true,
            settings: {audio: {}, video: {}},
            volume: {
                locked: false,
                value: 100,
            },
        }

        app.$s.streams.push(streamState)
    }

    async onJoined(kind, group, perms, message, status) {
        app.logger.debug(`[onJoined] ${kind}/${group}`)
        switch(kind) {
        case 'fail':
            this.promiseConnect.reject(message)
            this.promiseConnect = null

            // Closing the connection will trigger a 'leave' message,
            // which handles the accompanying UI flow.
            this.connection.close()
            return
        case 'leave':
            this.disconnect()
            return
        case 'join':
            app.$s.permissions = perms
            this.promiseConnect.resolve(message)
            this.promiseConnect = null
            break
        case 'change':
            app.$s.permissions = perms

            if (status && status.locked) {
                app.$s.group.locked = true
                // A custom message is sent along:
                let personal = null
                if (status.locked !== true) personal = {group, message:status.locked}
                app.notifier.message('lock', {group}, personal)
            }
            else if (app.$s.group.locked) {
                app.$s.group.locked = false
                app.notifier.message('unlock', {group})
            }

            app.logger.debug(`permissions: ${JSON.stringify(perms)}`)
            if(kind === 'change')
                return
            break
        default:
            app.notifier.notify({level: 'error', message: 'Unknown join message'})
            this.connection.close()
            return
        }

        app.logger.debug(`request Galène media types: ${app.$s.media.accept.id}`)
        this.connection.request(this.mapRequest(app.$s.media.accept.id))

        if(this.connection.permissions.present && !this.findUpMedia('camera')) {
            await app.$m.media.getUserMedia(app.$s.devices)
        }
    }

    onUser(id, kind, permission, status) {
        let user = {...this.connection.users[id], id}
        app.logger.debug(`[onUser] ${kind}/${id}/${user.username}`)

        if (kind ==='add') {
            // There might be a user with name 'RECORDING' that is an ordinary user;
            // only trigger the recording flag when it is a system user.
            if (user.username === 'RECORDING' && user.permissions.system) {
                app.$s.group.recording = user.id
                app.notifier.message('record', {group: app.$s.group.name})
            }

            if (id === app.$s.user.id) {
                // Restore user status back from state and notify others about it.
                user.status = app.$s.user.status
                this.connection.userAction('setstatus', this.connection.id, app.$s.user.status)
            }

            app.$s.users.push(user)
            app.emit('user', {action: 'add', user})
        } else if (kind === 'change') {
            if (id === app.$s.user.id) {
                const $user = app.$s.users.find((i) => i.id === user.id)
                // Shutdown the local stream when the Present permission is taken away.
                if($user.permissions.present && !user.permissions.present) {
                    this.delUpMedia(this.localGlnStream)
                    app.$s.devices.cam.enabled = false
                    app.$s.devices.mic.enabled = false

                    app.notifier.message('unpresent', {group: app.$s.group.name})
                } else if (!$user.permissions.present && user.permissions.present) {
                    app.notifier.message('present')
                } else if ($user.permissions.op && !user.permissions.op) {
                    app.notifier.message('unop')
                } else if (!$user.permissions.op && user.permissions.op) {
                    app.notifier.message('op')
                }

                if (status) {
                    app.$s.user.status = {...app.$s.user.status, ...status}

                    app.store.save()
                }
            }

            app.$s.users.splice(app.$s.users.findIndex((i) => i.id === user.id), 1, user)
        } else if (kind === 'delete') {
            if (user.id === app.$s.group.recording) {
                app.$s.group.recording = false
                app.notifier.message('unrecord', {group: app.$s.group.name})
            }

            app.$s.users.splice(app.$s.users.findIndex((u) => u.id === id), 1)
            app.emit('user', {action: 'del', user})
        }
    }

    onUserMessage(id, dest, username, time, privileged, kind, message) {
        let source = username
        if (!source) {
            if (id) source = 'Anonymous'
            else source = 'System Message'
        }

        // Handle incoming notifications here...
        app.notifier.onUserMessage({id, kind, message, privileged, source})
        // Remote actions are only allowed for operators.
        if(!privileged) return

        // Handle related actions here...
        if (kind === 'mute') {
            this.muteMicrophone(true)
        } else if (kind === 'clearchat') {
            app.$s.chat.channels.main.messages = []
        }
    }

    removeTrack(glnStream, kind) {
        const tracks = glnStream.stream.getTracks()
        tracks.forEach(track => {
            if (track.kind === kind) {
                app.logger.debug(`stopping track ${track.id}`)
                track.stop()

                const streamState = app.$s.streams.find((s) => s.id === glnStream.id)
                streamState.hasVideo = false
            }
        })
    }

    async setMaxVideoThroughput(c, bps) {
        const unlimitedRate = 1000000000

        let senders = c.pc.getSenders()
        for(let i = 0; i < senders.length; i++) {
            let s = senders[i]
            if(!s.track || s.track.kind !== 'video')
                continue
            let p = s.getParameters()
            if(!p.encodings) p.encodings = [{}]
            p.encodings.forEach(e => {
                if(!e.rid || e.rid === 'h') e.maxBitrate = bps || unlimitedRate

            })
            app.logger.debug(`set video throughput at max ${bps} bps`)

            await s.setParameters(p)
        }
    }

    stopUpMedia(c) {
        app.logger.debug(`stopping up-stream ${c.id}`)
        c.stream.getTracks().forEach(t => t.stop())

        app.$s.upMedia[c.label].splice(app.$s.upMedia[c.label].indexOf(c.id), 1)
        app.$s.streams.splice(app.$s.streams.indexOf(c.id), 1)
    }

}

export default ModelSFU
