<template>
    <div class="c-chat">
        <div ref="messages" class="messages">
            <div
                v-for="message of sortedMessages" :key="message.message"
                class="message"
                :class="{command: !message.nick}"
            >
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
                :placeholder="$t('Type /help for help')"
                @keydown.enter="$event.preventDefault()"
                @keyup.enter="sendMessage"
            />
        </div>
    </div>
</template>

<script>
import commands from '../js/commands'
import {nextTick} from 'vue'

export default {
    computed: {
        sortedMessages() {
            const messages = this.$s.messages
            return messages.sort((a, b) => a.time - b.time)
        },
    },
    data() {
        return {
            rawMessage: '',
        }
    },
    methods: {
        clearChat() {
            app.logger.debug('clearing chat from remote')
            this.$s.messages = []
        },
        formatMessage(message) {
            return message.split('\n')
        },
        formatTime(ts) {
            const date = new Date(ts)
            return date.toLocaleTimeString()
        },
        onChat(peerId, dest, nick, time, privileged, kind, message) {
            this.$s.messages.push({dest, kind, message, nick, peerId, privileged, time})
            nextTick(() => {
                this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
            })
        },
        sendMessage(e) {
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
                        let c = commands[cmd]
                        if(!c) {
                            app.notify({
                                level: 'error',
                                message: `Uknown command /${cmd}, type /help for help`,
                            })
                            return
                        }
                        if(c.predicate) {
                            const message = c.predicate()
                            if(message) {
                                app.notify({level: 'error', message})
                                return
                            }
                        }
                        try {
                            c.f(cmd, rest)
                        } catch(e) {
                            app.notify({level: 'error', message: e})
                        }
                        return
                    }
                }
            } else {
                message = this.rawMessage
                me = false
            }

            app.connection.chat(me ? 'me' : '', '', message)
            this.rawMessage = ''
        },
    },
    mounted() {
        app.connection.onchat = this.onChat.bind(this)
        app.connection.onclearchat = this.clearChat.bind(this)
    },
}
</script>

<style lang="postcss">
.c-chat {
    border-right: var(--border) solid var(--grey-300);
    display: flex;
    flex-direction: column;
    overflow: auto;
    resize: horizontal;
    width: 350px;

    & .messages {
        background: var(--grey-500);
        border-left: var(--border) solid var(--grey-300);

        flex: 1;
        overflow-y: scroll;
        padding-top: calc(var(--spacer) * 2);

        & .message {
            background: var(--grey-300);
            color: var(--grey-50);
            margin-bottom: calc(var(--spacer) * 2);
            margin-left: calc(var(--spacer) * 2);
            margin-right: var(--spacer);
            padding: var(--spacer);

            &.command {
                background: var(--grey-400);
                color: var(--grey-100);
                font-size: var(--text-small);
            }

            & header {
                color: var(--primary-color);
                display: flex;
                font-size: var(--text-small);
                font-weight: 600;
                justify-content: space-between;
                margin-bottom: var(--spacer);

                & .time {
                    font-size: var(--text-tiny);
                }
            }
        }
    }

    & .send {
        background: var(--grey-400);
        border-top: var(--border) solid var(--grey-300);
        display: flex;
        padding-bottom: var(--space-1);
        padding-top: var(--spacer);

        & button {
            align-items: center;
            background: var(--grey-500);
            display: flex;
            height: var(--unit);
            justify-content: center;
            padding: 0;
            width: var(--space-3);

            &:not([disabled]):hover {
                cursor: pointer;
            }

            & svg {
                height: var(--space-2);
            }
        }

        & textarea {
            background: var(--grey-500);
            border: var(--border) solid var(--grey-500);
            color: var(--primary-color);
            flex: 1;
            outline: none;
            overflow-y: hidden;
            padding: var(--spacer);

            &::placeholder {
                color: var(--grey-200);
            }
        }
    }
}
</style>
