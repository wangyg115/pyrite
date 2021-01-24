<template>
    <div class="c-chat">
        <div ref="messages" class="messages">
            <div v-for="message of sortedMessages" :key="message.message" class="message">
                <header>
                    <div class="author">
                        {{ message.nick }}
                    </div><div class="time">
                        {{ formatTime(message.time) }}
                    </div>
                </header>
                <section>
                    {{ message.message }}
                </section>
            </div>
        </div>
        <div class="send">
            <textarea
                v-model="rawMessage"
                :placeholder="inputPlaceholder"
                @keydown.enter="$event.preventDefault()"
                @keyup.enter="sendMessage"
            />
            <button
                class="btn btn-default"
                @click="sendMessage"
            >
                <icon class="icon icon-mini" name="send" />
            </button>
        </div>
    </div>
</template>

<script>
import { nextTick } from 'vue'
export default {
    data() {
        return {
            inputPlaceholder: 'Type /help for help',
            rawMessage: '',
            messages: [],
            state: app.state,
        }
    },
    computed: {
        sortedMessages() {
            const messages = this.messages
            return messages.sort((a, b) => a.time - b.time)
        }
    },
    mounted() {
        app.connection.onchat = this.onChat.bind(this)
        app.connection.onclearchat = this.clearChat.bind(this)
        setTimeout(() => {
            this.inputPlaceholder = ''
        }, 8000)
    },
    methods: {
        onChat(peerId, dest, nick, time, privileged, kind, message) {
            this.messages.push({peerId, dest, nick, time, privileged, kind, message})
            nextTick(() => {
                this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
            })
        },
        clearChat() {
            app.logger.debug('clearing chat from remote')
            this.messages = []
        },
        formatTime(ts) {
            const date = new Date(ts)
            return date.toLocaleTimeString()
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

                    if(cmd === 'me') {
                        message = rest
                        me = true
                    } else {
                        let c = commands[cmd]
                        if(!c) {
                            app.displayError(`Uknown command /${cmd}, type /help for help`)
                            return
                        }
                        if(c.predicate) {
                            let s = c.predicate()
                            if(s) {
                                app.displayError(s)
                                return
                            }
                        }
                        try {
                            c.f(cmd, rest)
                        } catch(e) {
                            app.displayError(e)
                        }
                        return
                    }
                }
            } else {
                message = this.rawMessage
                me = false
            }

            try {
                app.connection.chat(this.state.username, me ? 'me' : '', '', message)
            } catch(e) {
                console.error(e)
                app.displayError(e)
            }

            this.rawMessage = ''
        }
    }
}
</script>

<style lang="postcss">
.c-chat {
    display: flex;
    flex-direction: column;
    overflow: auto;
    resize: horizontal;
    width: 300px;

    & .messages {
        background: var(--grey-500);
        border-left: var(--border) solid var(--grey-300);
        border-right: var(--border) solid var(--grey-300);
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


            & header {
                color: var(--primary-color);
                display: flex;
                font-size: var(--text-small);
                justify-content: space-between;
                margin-bottom: var(--spacer);
            }
        }
    }

    & .send {
        background: var(--grey-400);
        border-top: var(--border) solid var(--grey-300);
        display: flex;
        padding: var(--spacer) 0;

        & button {
            align-items: center;
            background: var(--grey-500);
            display: flex;
            height: var(--space-2);
            justify-content: center;
            padding: 0;
            width: var(--space-3);

            & svg {
                height: var(--space-2);
            }
        }

        & button,
        & input {
            height: var(--unit);
        }

        & textarea {
            background: var(--grey-500);
            border: 0;
            color: var(--primary-color);
            flex: 1;
            height: var(--space-2);
            margin-right: var(--spacer);
            outline: none;
            /* line-height: var(--space-2); */
            overflow-y: hidden;
            padding: var(--spacer);
        }
    }
}
</style>