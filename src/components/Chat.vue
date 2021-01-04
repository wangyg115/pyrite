<template>
    <div id="chat">
        <div id="chatbox">
            <div
                id="close-chat"
                class="close-chat"
                title="Hide chat"
                @click="state.chat.active = !state.chat.active"
            >
                <span class="close-icon" />
            </div>
            <div id="box" />
            <div class="reply">
                <form id="inputform">
                    <textarea
                        id="input"
                        class="form-reply"
                        @onkeypress="handleChatInput()"
                    />
                    <input
                        id="inputbutton"
                        class="btn btn-default"
                        type="submit"
                        value="&#10148;"
                    >
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {state: app.state}
    },
    methods: {
        /**
         * @param {string} peerId
         * @param {string} nick
         * @param {number} time
         * @param {string} kind
         * @param {string} message
         */
        addToChatbox(peerId, dest, nick, time, privileged, kind, message) {
            let userpass = getUserPass()
            let row = document.createElement('div')
            row.classList.add('message-row')
            let container = document.createElement('div')
            container.classList.add('message')
            row.appendChild(container)
            let footer = document.createElement('p')
            footer.classList.add('message-footer')
            if(!peerId)
                container.classList.add('message-system')
            if(userpass.username === nick)
                container.classList.add('message-sender')
            if(dest)
                container.classList.add('message-private')

            if(kind !== 'me') {
                let p = formatLines(message.split('\n'))
                let doHeader = true
                if(!peerId && !dest && !nick) {
                    doHeader = false
                } else if(lastMessage.nick !== (nick || null) ||
                        lastMessage.peerId !== peerId ||
                        lastMessage.dest !== (dest || null) ||
                        !time || !lastMessage.time) {
                    doHeader = true
                } else {
                    let delta = time - lastMessage.time
                    doHeader = delta < 0 || delta > 60000
                }

                if(doHeader) {
                    let header = document.createElement('p')
                    if(peerId || nick || dest) {
                        let user = document.createElement('span')
                        user.textContent = dest ?
                            `${nick||'(anon)'} \u2192 ${users[dest]||'(anon)'}` :
                            (nick || '(anon)')
                        user.classList.add('message-user')
                        header.appendChild(user)
                    }
                    header.classList.add('message-header')
                    container.appendChild(header)
                    if(time) {
                        let tm = document.createElement('span')
                        tm.textContent = formatTime(time)
                        tm.classList.add('message-time')
                        header.appendChild(tm)
                    }
                }

                p.classList.add('message-content')
                container.appendChild(p)
                lastMessage.nick = (nick || null)
                lastMessage.peerId = peerId
                lastMessage.dest = (dest || null)
                lastMessage.time = (time || null)
                container.appendChild(footer)
            } else {
                let asterisk = document.createElement('span')
                asterisk.textContent = '*'
                asterisk.classList.add('message-me-asterisk')
                let user = document.createElement('span')
                user.textContent = nick || '(anon)'
                user.classList.add('message-me-user')
                let content = document.createElement('span')
                formatLine(message).forEach(elt => {
                    content.appendChild(elt)
                })
                content.classList.add('message-me-content')
                container.appendChild(asterisk)
                container.appendChild(user)
                container.appendChild(content)
                container.classList.add('message-me')
                lastMessage = {}
            }

            let box = document.getElementById('box')
            box.appendChild(row)
            if(box.scrollHeight > box.clientHeight) {
                box.scrollTop = box.scrollHeight - box.clientHeight
            }

            return message
        },
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