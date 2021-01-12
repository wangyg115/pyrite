<template>
    <nav class="c-controls panel">
        <button
            v-show="state.permissions.present"
            class="btn btn-menu active"
            @click="disconnect"
        >
            <Icon class="icon-small" name="logout" />
        </button>

        <button
            v-show="state.permissions.present && state.upMedia.local.length"
            class="btn btn-menu"
            @click="present"
        >
            Ready
        </button>

        <button
            v-show="state.upMedia.local.length"
            @click="unpresent"
        >
            Panic
        </button>
        <button
            v-show="state.permissions.present"
            class="btn btn-menu active"
            @click="mute"
        >
            <Icon class="icon-small" name="mute" />
        </button>

        <button
            v-if="state.permissions.present && !state.upMedia.screenshare.length"
            class="btn btn-menu"
            :class="{active: state.upMedia.screenshare.length}"
            @click="share"
        >
            <Icon class="icon-small" name="screenshare" />
        </button>

        <button
            v-show="state.upMedia.video.length"
            class="menu btn-menu"
            @click="stopVideo"
        >
            Stop Video
        </button>
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
        disconnect() {
            app.connection.close()
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
            // e.preventDefault()
            // let localMute = getSettings().localMute
            // localMute = !localMute
            // setLocalMute(localMute, true)
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

<style lang="postcss">
.c-controls {
    background: var(--grey-500);
    display: flex;
    flex-direction: column;
}
</style>