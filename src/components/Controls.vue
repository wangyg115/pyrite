<template>
    <nav class="c-controls panel">
        <button
            v-if="state.connected"
            class="btn btn-menu active"
            @click="disconnect"
        >
            <Icon class="icon-small" name="logout" />
        </button>

        <button
            v-if="state.connected && state.upMedia.local.length"
            v-show="state.permissions.present && state.upMedia.local.length"
            class="btn btn-menu active"
            @click="unpresent"
        >
            <Icon class="icon-small" name="webcam" />
        </button>

        <button
            v-else-if="state.connected"
            class="btn btn-menu"
            @click="present"
        >
            <Icon class="icon-small" name="webcam" />
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
            console.log('PRESENT')
            let id = app.findUpMedia('local')
            if(!id) await app.addLocalMedia()

        },
        share() {
            console.log('SHARE')
            app.addShareMedia()
        },
        stopVideo(e) {
            app.delUpMediaKind('video')
            resizePeers()
        },
        unpresent(e) {
            console.log('UNPRESENT')
            app.delUpMediaKind('local')
        },
        unshare() {
            console.log('UNSHARE')
            app.delUpMediaKind('screenshare')
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