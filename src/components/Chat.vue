<template>
    <div class="c-chat">
        <div class="messages">
            <div v-for="message of messages" :key="message.message" class="message">
                <div class="author">
                    {{ message.nick }}
                </div><div class="time">
                    {{ message.time }}
                </div>
                <div class="body">
                    {{ message.message }}
                </div>
            </div>
        </div>
        <div class="send">
            <textarea
                id="input"
                v-model="rawMessage"
                :placeholder="inputPlaceholder"
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
export default {
    data() {
        return {
            inputPlaceholder: 'Type /help for help',
            rawMessage: '',
            messages: [],
            state: app.state,
        }
    },
    mounted() {
        app.connection.onchat = this.addToChatbox.bind(this)
        app.connection.onclearchat = this.clearChat.bind(this)
        setTimeout(() => {
            this.inputPlaceholder = ''
        }, 8000)
    },
    methods: {
        addToChatbox(peerId, dest, nick, time, privileged, kind, message) {
            this.messages.push({peerId, dest, nick, time, privileged, kind, message})
        },
        clearChat() {
            console.log('CLEAR CHAT')
        },
        handleChatInput() {
            if(e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                e.preventDefault()
                this.handleInput()
            }
        },
        sendMessage() {
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
        flex: 1;

        & .message {
            background: var(--grey-200);
            color: var(--grey-50);
            margin: var(--spacer);
            padding: var(--spacer);
        }
    }

    & .send {
        display: flex;

        & button,
        & textarea {
            height: var(--unit);
        }

        & textarea {
            flex: 1;
        }
    }
}
</style>