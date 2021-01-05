<template>
    <div class="c-chat">
        <div class="messages" />
        <div class="send">
            <textarea
                id="input"
                :placeholder="inputPlaceholder"
                @onkeypress="handleChatInput()"
            />
            <button
                class="btn btn-default"
                type="submit"
                value="&#10148;"
            >
                Send
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            inputPlaceholder: 'Type /help for help',
            state: app.state
        }
    },
    mounted() {
        setTimeout(() => {
            this.inputPlaceholder = ''
        }, 8000)
    },
    methods: {
        handleChatInput() {
            if(e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                e.preventDefault()
                this.handleInput()
            }
        },
        handleInput() {
            let input = /** @type {HTMLTextAreaElement} */
                (document.getElementById('input'))
            let data = input.value
            input.value = ''

            let me, message

            if(data === '')
                return

            if(data[0] === '/') {
                if(data.length > 1 && data[1] === '/') {
                    message = data.slice(1)
                    me = false
                } else {
                    let cmd, rest
                    let space = data.indexOf(' ')
                    if(space < 0) {
                        cmd = data.slice(1)
                        rest = ''
                    } else {
                        cmd = data.slice(1, space)
                        rest = data.slice(space + 1)
                    }

                    if(cmd === 'me') {
                        message = rest
                        me = true
                    } else {
                        let c = commands[cmd]
                        if(!c) {
                            displayError(`Uknown command /${cmd}, type /help for help`)
                            return
                        }
                        if(c.predicate) {
                            let s = c.predicate()
                            if(s) {
                                displayError(s)
                                return
                            }
                        }
                        try {
                            c.f(cmd, rest)
                        } catch(e) {
                            displayError(e)
                        }
                        return
                    }
                }
            } else {
                message = data
                me = false
            }

            if(!serverConnection || !serverConnection.socket) {
                displayError("Not connected.")
                return
            }

            let username = getUsername()
            try {
                serverConnection.chat(username, me ? 'me' : '', '', message)
            } catch(e) {
                console.error(e)
                displayError(e)
            }
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
        background: #0FF;
        flex: 1;
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