import {app} from '@/js/app.js'

export default function() {
    return new class Notify {

        constructor() {
            this.messages = {
                clearchat: {
                    level: 'warning',
                    source: 'General chat history was removed',
                    target: 'General chat history was removed',
                },
                error: {
                    level: 'error',
                    target: 'an error occured: {message}',
                },
                kicked: {
                    level: 'warning',
                    source: 'you removed participant {target}',
                    target: 'you were removed by operator {source}',
                },
                lock: {
                    level: 'warning',
                    source: 'you locked group {group}',
                    target: 'group {group} has been locked',
                },
                mute: {
                    level: 'warning',
                    source: 'You muted the microphone of participant {target}',
                    target: 'your microphone was muted by operator {source}',
                },
                notification: {
                    level: 'info',
                    source: 'notification sent to participant {target}: {message}',
                    target: 'incoming notification from operator {source}: {message}',
                },
                op: {
                    level: 'info',
                    source: 'you assigned the operator role to participant {target}',
                    target: 'you aqcuired the operator role', // The source is unknown in the onUser event
                },
                present: {
                    level: 'info',
                    source: 'you assigned the presenter role to {target}',
                    target: 'you aqcuired the presenter role', // The source is unknown in the onUser event
                },
                raisehand: {
                    chat: '{source} requested speaking time',
                },
                record: {
                    level: 'warning',
                    target: 'group {group} is being recorded!',
                },
                unlock: {
                    level: 'warning',
                    source: 'group {group} has been unlocked',
                    target: 'group {group} has been unlocked',
                },
                unop: {
                    level: 'info',
                    source: 'you revoked the operator role from participant {target}',
                    target: 'your operator role was revoked', // The source is unknown in the onUser event
                },
                unpresent: {
                    level: 'info',
                    source: 'you revoked the presenter role from participant {target}',
                    target: 'your presenter role was revoked', // The source is unknown in the onUser event
                },
                unrecord: {
                    level: 'warning',
                    target: 'group {group} stopped being recorded',
                },
            }
        }

        /**
         * A shared entrypoint for messages that have a
         * source and a target message. Use `context.dir`
         * to assign the message direction.
         * @param {*} messageId
         * @param {*} context
         * @param {*} personal
         * @param {*} channels
         */
        message(messageId, context = {dir: 'target'}, personal = null, {chat = false, notification = true} = {}) {
            const message = this.messages[messageId]
            if (notification) {
                if (!context.dir) context.dir = 'target'
                this.notify({
                    level: message.level,
                    message: app.$t(message[context.dir], context),
                    personal,
                })
            }

            if (chat) {
                let chatMessage = app.$t(message.chat)
                if (personal) chatMessage = `${chatMessage} (${personal.message})`
                app.$m.sfu.connection.chat('me', '', chatMessage)
            }
        }

        notify(notification) {
            if (!this.notificationId) {
                this.notificationId = 1
                notification.id = this.notificationId
            }

            if (typeof notification.timeout === 'undefined') {
                notification.timeout = 5000
            }

            app.$s.notifications.push(notification)
            setTimeout(() => {
                app.$s.notifications.splice(app.$s.notifications.findIndex(i => i.id === notification.id), 1)
            }, notification.timeout)

            this.notificationId += 1
        }

        onUserMessage({kind, message, privileged, source}) {
            app.logger.debug(`incoming notify: ${kind}`)
            // All notifications are triggered from privileged actions at the moment.
            if(!privileged) return

            if (kind === 'error') {
                // Ignore this message; this happens when a stream can
                // no longer be played due to revoked present permission.
                // This is dealt with at another place.
                if (message === 'permission denied') return
                this.notify({level: 'error', message})
            } else if (kind === 'info') {
                this.notify({level: 'info', message})
            }

            let personal = null

            if (kind === 'kicked') {
                // No personal message if its the default message...
                if (message !== 'you have been kicked out') {
                    personal = {message, op: source}
                }
            } else if (message) {
                personal = {message, source}
            }

            app.logger.debug(`onUserMessage: ${app.$t(this.messages[kind].target, {group: app.$s.group.name, source})}`)

            this.notify({
                level: this.messages[kind].level,
                message:  app.$t(this.messages[kind].target, {group: app.$s.group.name, message, source}),
                personal,
            })
        }
    }
}
