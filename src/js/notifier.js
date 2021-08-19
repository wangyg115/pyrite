export default function() {
    return new class Notify {

        constructor() {
            this.messages = {
                clearchat: {
                    level: 'warning',
                    source: 'General chat history has been cleared',
                    target: 'General chat history has been cleared',
                },
                error: {
                    level: 'error',
                    target: 'An error occured: {message}',
                },
                kicked: {
                    level: 'warning',
                    source: 'You kicked Participant {target}',
                    target: 'You were kicked by Operator {source}',
                },
                lock: {
                    level: 'warning',
                    source: 'You locked group {group}',
                    target: 'Group {group} has been locked',
                },
                mute: {
                    level: 'warning',
                    source: 'You muted the microphone of Participant {target}',
                    target: 'Your microphone was muted by Operator {source}',
                },
                notify: {
                    level: 'info',
                    source: 'Notification sent to Participant {target}: {message}',
                    target: 'Incoming notification from Operator {source}',
                },
                op: {
                    level: 'info',
                    source: 'You assigned the Operator role to Participant {target}',
                    target: 'You aqcuired the Operator role', // The source is unknown in the onUser event
                },
                present: {
                    level: 'info',
                    source: 'You assigned the Presenter role to {target}',
                    target: 'You aqcuired the Presenter role', // The source is unknown in the onUser event
                },
                raisehand: {
                    chat: '{source} raised a hand',
                },
                record: {
                    level: 'warning',
                    target: 'Group {group} is being recorded!',
                },
                unlock: {
                    level: 'warning',
                    source: 'Group {group} has been unlocked',
                    target: 'Group {group} has been unlocked',
                },
                unop: {
                    level: 'info',
                    source: 'You revoked the Operator role from Participant {target}',
                    target: 'Your Operator role was revoked', // The source is unknown in the onUser event
                },
                unpresent: {
                    level: 'info',
                    source: 'You revoked the Presenter role from Participant {target}',
                    target: 'Your Presenter role was revoked', // The source is unknown in the onUser event
                },
                unrecord: {
                    level: 'warning',
                    target: 'Group {group} stopped being recorded',
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
        message(messageId, context = {dir: 'target'}, personal = null, {chat =  false, notification = true} = {}) {
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
                app.connection.chat('me', '', chatMessage)
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
                message:  app.$t(this.messages[kind].target, {group: app.$s.group.name, source}),
                personal,
            })
        }
    }
}
