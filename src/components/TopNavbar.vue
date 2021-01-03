<template>
    <nav class="topnav navbar navbar-expand navbar-light fixed-top">
        <div id="header">
            <div
                id="sidebarCollapse"
                class="collapse"
                title="Collapse left panel"
                @click="collapseSidebar"
            >
                <svg
                    aria-hidden="true"
                    class="svg-inline--fa"
                    data-icon="align-left"
                    role="img"
                    viewBox="0 0 448 512"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M288 44v40c0 8.837-7.163 16-16 16H16c-8.837 0-16-7.163-16-16V44c0-8.837 7.163-16 16-16h256c8.837 0 16 7.163 16 16zM0 172v40c0 8.837 7.163 16 16 16h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16zm16 312h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm256-200H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16h256c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16z"
                        fill="currentColor"
                    />
                </svg>
            </div>
            <h1 id="title" class="header-title">
                {{ state.title }}
            </h1>
        </div>

        <ul class="nav-menu">
            <li>
                <button
                    v-show="state.permissions.present && state.upMedia.local.length"
                    id="presentbutton"
                    class="invisible btn btn-success"
                    @click="present"
                >
                    <i aria-hidden="true" class="fas fa-play" />
                    <span class="nav-text"> Ready</span>
                </button>
            </li>
            <li>
                <button
                    v-show="state.upMedia.local.length"
                    id="unpresentbutton"
                    class="invisible btn btn-cancel"
                    @click="unpresent"
                >
                    <i aria-hidden="true" class="fas fa-stop" />
                    <span class="nav-text"> Panic</span>
                </button>
            </li>
            <li>
                <div
                    v-show="state.permissions.present"
                    id="mutebutton"
                    class="nav-link nav-button"
                    @click="mute"
                >
                    <span><i
                        aria-hidden="true"
                        class="fas fa-microphone-slash"
                    /></span>
                    <label>Mute</label>
                </div>
            </li>
            <li>
                <div
                    v-if="state.permissions.present"
                    id="sharebutton"
                    class="invisible nav-link nav-button"
                    @click="share"
                >
                    <span>
                        <i aria-hidden="true" class="fas fa-share-square" />
                    </span>
                    <label>Share Screen</label>
                </div>
            </li>
            <li>
                <div
                    v-show="state.upMedia.screenshare.length"
                    id="unsharebutton"
                    class="invisible nav-link nav-button nav-cancel"
                    @click="unshare"
                >
                    <span>
                        <i aria-hidden="true" class="fas fa-window-close" />
                    </span>
                    <label>Unshare Screen</label>
                </div>
            </li>
            <li>
                <div
                    v-show="state.upMedia.video.length"
                    id="stopvideobutton"
                    class="invisible nav-link nav-button nav-cancel"
                    @click="stopVideo"
                >
                    <span>
                        <i aria-hidden="true" class="fas fa-window-close" />
                    </span>
                    <label>Stop Video</label>
                </div>
            </li>
            <li>
                <div
                    id="openside"
                    class="nav-button nav-link nav-more"
                    @click="openSide"
                >
                    <span><i aria-hidden="true" class="fas fa-ellipsis-v" /></span>
                </div>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    data() {
        return {state: app.state}
    },
    methods: {
        collapseSidebar() {
            document.getElementById("left-sidebar").classList.toggle("active")
            document.getElementById("mainrow").classList.toggle("full-width-active")
        },
        openSide() {
            let sidewidth = document.getElementById("sidebarnav").style.width
            if (sidewidth !== "0px" && sidewidth !== "") {
                document.getElementById("sidebarnav").style.width = "0"
                return
            } else {
                document.getElementById("sidebarnav").style.width = "250px"
            }
        },
        mute(e) {
            e.preventDefault()
            let localMute = getSettings().localMute
            localMute = !localMute
            setLocalMute(localMute, true)
        },
        async present(e) {
            e.preventDefault()
            let button = this
            if(!(button instanceof HTMLButtonElement))
                throw new Error('Unexpected type for this.')
            // there's a potential race condition here: the user might click the
            // button a second time before the stream is set up and the button hidden.
            button.disabled = true
            try {
                let id = app.findUpMedia('local')
                if(!id) await addLocalMedia()
            } finally {
                button.disabled = false
            }
        },
        share(e) {
            e.preventDefault()
            addShareMedia()
        },
        stopVideo(e) {
            e.preventDefault()
            delUpMediaKind('video')
            resizePeers()
        },
        unpresent(e) {
            e.preventDefault()
            delUpMediaKind('local')
            resizePeers()
        },
        unshare(e) {
            e.preventDefault()
            delUpMediaKind('screenshare')
            resizePeers()
        }
    }
}
</script>