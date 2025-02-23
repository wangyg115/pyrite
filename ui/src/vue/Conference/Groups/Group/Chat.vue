<template>
    <div ref="view" class="c-chat">
        <div class="chat-channels">
            <div
                v-for="(channel, key) in $s.chat.channels"
                :key="key" class="chat-channel"
                :class="{active: channel.id === $s.chat.channel}"
                @click="selectChannel(channel)"
            >
                <div class="channel-name">
                    <Icon class="icon icon-mini" :icon-props="{unread: channel.unread}" name="Chat" />
                </div>
                <span v-if="key === 'main'" class="ucfl">
                    {{ $t('general') }}
                </span>
                <span v-else>
                    {{ channel.name }}
                </span>

                <button v-if="channel.id !== 'main'" class="btn btn-icon btn-close" @click.stop="closeChannel(channel)">
                    <Icon class="icon icon-tiny" name="Close" />
                </button>
            </div>
        </div>
        <div ref="messages" class="messages scroller">
            <div
                v-for="message of sortedMessages" :key="message.message"
                class="message"
                :class="{command: !message.nick, [message.kind]: true}"
            >
                <template v-if="message.kind === 'me'">
                    <div class="text">
                        {{ message.nick }} {{ $t(message.message) }}...
                    </div>
                    <div class="time">
                        {{ formatTime(message.time) }}
                    </div>
                </template>

                <template v-else>
                    <header v-if="message.nick">
                        <div class="author">
                            {{ message.nick }}
                        </div><div class="time">
                            {{ formatTime(message.time) }}
                        </div>
                    </header>
                    <section>
                        <div v-for="msg of formatMessage(message.message)" :key="msg.id">
                            {{ msg }}
                        </div>
                    </section>
                </template>
            </div>
        </div>
        <div class="send">
            <button
                class="btn btn-menu tooltip"
                :data-tooltip="$t('send message')"
                :disabled="rawMessage === ''"
                @click="sendMessage"
            >
                <Icon class="icon icon-mini" name="Send" />
            </button>
            <textarea
                v-model="rawMessage"
                autofocus
                :placeholder="$t('type /help for help')"
                @keydown.enter="$event.preventDefault()"
                @keyup.enter="sendMessage"
            />
        </div>
    </div>
</template>

<script>
import {nextTick} from 'vue'

export default {
    beforeUnmount() {
        this.resizeObserver.disconnect()
    },
    computed: {
        sortedMessages() {
            const messages = this.$s.chat.channels[this.$s.chat.channel].messages
            return messages.sort((a, b) => a.time - b.time)
        },
    },
    created() {
        this.app.on('chat:message', async({channelId}) => {
            if (channelId === this.$s.chat.channel) {
                // A message was added to the active channel; update the chat scroller.
                await nextTick()
                if (this.$refs.messages) {
                    this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
                }
            } else {
                // User is currently watching another channel; bump unread.
                this.$s.chat.channels[channelId].unread += 1
            }
        })
        // User left; clean up the channel.
        this.app.on('user', ({action, user}) => {
            if (action === 'del' && this.$s.chat.channels[user.id]) {
                // Change the active to-be-deleted channel to main
                if (this.$s.chat.channel === user.id) {
                    this.switchChannel('main')
                }
                delete this.$s.chat.channels[user.id]
            }
        })

        this.app.on('channel', ({action, channelId, channel = null}) => {
            this.app.logger.debug('switch chat channel to ', channelId)
            if (action === 'switch') {
                if (!this.$s.chat.channels[channelId]) {
                    this.$s.chat.channels[channelId] = channel
                }

                this.switchChannel(channelId)
            }
        })
    },
    data() {
        return {
            rawMessage: '',
        }
    },
    methods: {
        async closeChannel(channel) {
            // Return to the main channel when closing a direct user channel.
            this.switchChannel('main')
            delete this.$s.chat.channels[channel.id]
        },
        formatMessage(message) {
            return message.split('\n')
        },
        formatTime(ts) {
            const date = new Date(ts)
            return date.toLocaleTimeString()
        },
        selectChannel(channel) {
            this.$s.chat.channel = channel.id
            this.$s.chat.channels[channel.id].unread = 0
        },
        async sendMessage(e) {
            this.rawMessage = this.rawMessage.trim()

            if(e instanceof KeyboardEvent) {
                // ctrl/shift/meta +enter is next line.
                if (!(e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.metaKey)) {
                    this.rawMessage += '\r\n'
                    return false
                }
            }

            if (this.rawMessage === '') {
                return false
            }

            let me, message

            if(this.rawMessage[0] === '/') {
                if(this.rawMessage.length > 1 && this.rawMessage[1] === '/') {
                    message = this.rawMessage.slice(1)
                    me = false
                } else {
                    let cmd, rest
                    let space = this.rawMessage.indexOf(' ')
                    if(space < 0) {
                        cmd = this.rawMessage.slice(1)
                        rest = ''
                    } else {
                        cmd = this.rawMessage.slice(1, space)
                        rest = this.rawMessage.slice(space + 1)
                    }

                    this.rawMessage = ''

                    if(cmd === 'me') {
                        message = rest
                        me = true
                    } else {
                        let c = this.$m.sfu.commands[cmd]
                        if(!c) {
                            this.app.notifier.notify({
                                level: 'error',
                                message: `Uknown command /${cmd}, type /help for help`,
                            })
                            return
                        }
                        if(c.predicate) {
                            const message = c.predicate()
                            if(message) {
                                this.app.notifier.notify({level: 'error', message})
                                return
                            }
                        }
                        try {
                            c.f(cmd, rest)
                        } catch(e) {
                            this.app.notifier.notify({level: 'error', message: e})
                        }
                        return
                    }
                }
            } else {
                message = this.rawMessage
                me = false
            }

            // Sending to the main channel uses an empty string;
            // a direct message uses the user (connection) id.
            if (this.$s.chat.channel === 'main') {
                this.$m.sfu.connection.chat(me ? 'me' : '', '', message)
            } else {
                // A direct message is not replayed locally through
                // onChat, so we need to add the message ourselves.
                this.$m.sfu.connection.chat(me ? 'me' : '', this.$s.chat.channel, message)
            }

            // Adjust the chat window scroller
            await nextTick()
            this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
            this.rawMessage = ''
        },
        switchChannel(name) {
            this.$s.chat.channel = name
            this.$s.chat.channels[name].unread = 0
        },
    },
    mounted() {
        // Keep track of the user-set width of the chat-window, so
        // we can restore it after toggling the chat window.
        this.resizeObserver = new ResizeObserver(async() => {
            this.$s.chat.width = parseInt(this.$refs.view.style.width.replace('px', ''))
        })

        this.resizeObserver.observe(this.$refs.view)

        this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
    },
}
</script>

<style lang="scss">
.c-chat {
    border-right: var(--border) solid var(--grey-4);
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: auto;
    resize: horizontal;
    width: 350px;

    .chat-channels {
        background: var(--grey-2);
        border-bottom: 2px solid var(--grey-4);
        display: flex;
        height: var(--space-4);
        width: 100%;

        .chat-channel {
            background: var(--grey-3);
            border: var(--border) solid var(--grey-4);
            color: var(--grey-6);
            display: flex;
            font-family: var(--font-secondary);
            margin: var(--spacer);
            padding: var(--spacer);
            user-select: none;

            .channel-name {
                align-items: center;
                display: flex;

                .icon {
                    margin-right: var(--spacer);
                }
            }

            &:hover {
                cursor: pointer;
            }

            &.active {
                background: var(--grey-2);
                color: var(--primary-color);
            }

            .btn-close {
                margin-left: var(--spacer);
            }
        }
    }

    .messages {
        background: var(--grey-2);
        flex: 1;
        overflow-x: hidden;
        overflow-y: scroll;
        padding-top: calc(var(--spacer) * 2);

        .message {
            margin-bottom: calc(var(--spacer) * 2);
            margin-left: calc(var(--spacer) * 2);
            margin-right: var(--spacer);
            padding: var(--spacer);

            &.default {
                background: var(--grey-4);
                border-radius: var(--spacer);
                color: var(--grey-7);

                & header {
                    align-items: center;
                    color: var(--primary-color);
                    display: flex;
                    font-size: var(--text-small);
                    font-weight: 600;
                    justify-content: space-between;
                    margin-bottom: var(--spacer);

                    .time {
                        font-size: var(--text-s);
                    }
                }
            }

            &.command {
                background: var(--grey-3);
                color: var(--grey-6);
                font-size: var(--text-small);
            }

            &.me {
                display: flex;
                font-style: italic;
                margin-left: 0;
                margin-right: 0;
                padding: 0 calc(var(--spacer) * 2);

                .text {
                    flex: 1;

                    &::first-letter {
                        text-transform: uppercase;
                    }
                }

                .time {
                    align-self: flex-end;
                    color: var(--grey-5);
                }
            }
        }
    }

    .send {
        background: var(--grey-3);
        border-top: var(--border) solid var(--grey-4);
        display: flex;
        padding-bottom: var(--space-1);
        padding-top: var(--spacer);

        button {
            align-items: center;
            background: var(--grey-2);
            display: flex;
            height: var(--unit);
            justify-content: center;
            padding: 0;
            width: var(--space-3);

            &:not([disabled]):hover {
                cursor: pointer;
            }
        }

        textarea {
            background: var(--grey-2);
            border: var(--border) solid var(--grey-2);
            color: var(--primary-color);
            flex: 1;
            outline: none;
            overflow-y: hidden;
            padding: var(--spacer);

            &::placeholder {
                color: var(--grey-7);
            }
        }
    }
}
</style>
