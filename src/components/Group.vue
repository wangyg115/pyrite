<template>
    <div id="main" class="app">
        <div class="row full-height">
            <nav id="left-sidebar">
                <div class="users-header">
                    <div class="galene-header">
                        Galène
                    </div>
                </div>
                <div class="header-sep" />
                <div id="users" />
            </nav>
            <div class="container">
                <header>
                    <TopNavbar />
                </header>
                <div id="mainrow" class="row full-width">
                    <div id="left" class="coln-left">
                        <Chat />
                    </div>
                    <div id="resizer" @mousedown="chatResizer" />
                    <div id="right" class="coln-right">
                        <span
                            id="switch-video"
                            class="show-video blink"
                            @click="switchVideo"
                        ><i aria-hidden="true" class="fas fa-exchange" /></span>

                        <div id="collapse-video" class="collapse-video" @click="collapseVideo">
                            <i class="far fa-comment-alt open-chat" title="Open chat" />
                        </div>
                        <StreamView v-if="state.connected" />
                        <Login />
                    </div>
                </div>
            </div>
        </div>
        <Notifications />
    </div>
</template>

<script>
import Chat from './Chat.vue'
import Login from './Login.vue'
import Notifications from './Notifications.vue'
import StreamView from './StreamView.vue'
import TopNavbar from './TopNavbar.vue'

export default {
    name: 'Group',
    components: {Chat, Login, Notifications, StreamView, TopNavbar},
    data() {
        return {state: app.state}
    },
    methods: {
        chatResizer(e) {
            e.preventDefault()
            let full_width = document.getElementById("mainrow").offsetWidth
            let left = document.getElementById("left")
            let right = document.getElementById("right")

            let start_x = e.clientX
            let start_width = left.offsetWidth

            function start_drag(e) {
                let left_width = (start_width + e.clientX - start_x) * 100 / full_width
                // set min chat width to 300px
                let min_left_width = 300 * 100 / full_width
                if (left_width < min_left_width) {
                    return
                }
                left.style.flex = left_width.toString()
                right.style.flex = (100 - left_width).toString()
            }
            function stop_drag(e) {
                document.documentElement.removeEventListener(
                    'mousemove', start_drag, false,
                )
                document.documentElement.removeEventListener(
                    'mouseup', stop_drag, false,
                )
            }

            document.documentElement.addEventListener(
                'mousemove', start_drag, false,
            )
            document.documentElement.addEventListener(
                'mouseup', stop_drag, false,
            )
        },
        closeChat() {
            e.preventDefault()
            let left = document.getElementById("left")
            left.style.display = "none"
            document.getElementById('collapse-video').style.display = "block"
        },
        collapseVideo() {
            e.preventDefault()
            if(!(this instanceof HTMLElement))
                throw new Error('Unexpected type for this')
            let width = window.innerWidth
            let left = document.getElementById("left")
            if (left.style.display === "" || left.style.display === "none") {
                // left chat is hidden, we show the chat and hide collapse button
                left.style.display = "block"
                this.style.display = ""
            }
            if (width <= 768) {
                // fixed div for small screen
                this.style.display = ""
                hideVideo(true)
                document.getElementById('switch-video').style.display = "block"
            }
        },
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
                closeVideoControls()
            }
        },
        showVideo() {
            let width = window.innerWidth
            let video_container = document.getElementById('video-container')
            video_container.classList.remove('no-video')
            if (width <= 768)
                document.getElementById('collapse-video').style.display = "block"
        },

        submitUserForm() {
            e.preventDefault()
            if(connecting)
                return
            connecting = true
            try {
                let username = getInputElement('username').value.trim()
                let password = getInputElement('password').value
                this.storeUserPass(username, password)
                serverConnect()
            } finally {
                connecting = false
            }

            if(getInputElement('presentboth').checked)
                presentRequested = 'both'
            else if(getInputElement('presentmike').checked)
                presentRequested = 'mike'
            else
                presentRequested = null

            getInputElement('presentoff').checked = true
        },
        /**
         * @param {string} username
         * @param {string} password
         */
        storeUserPass(username, password) {
            let userpass = {password, username }
            try {
                window.sessionStorage.setItem('userpass', JSON.stringify(userpass))
                fallbackUserPass = null
            } catch(e) {
                console.warn("Couldn't store password:", e)
                fallbackUserPass = userpass
            }
        },

        switchVideo() {
            e.preventDefault()
            if(!(this instanceof HTMLElement))
                throw new Error('Unexpected type for this')
            this.showVideo()
            this.style.display = ""
            document.getElementById('collapse-video').style.display = "block"
        }
    },
}
</script>
