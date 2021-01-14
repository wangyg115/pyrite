<template>
    <nav class="c-controls panel">
        <button
            v-if="state.connected && state.permissions.present"
            class="btn btn-menu"
            :class="{active: state.upMedia.local.length}"
            @click="togglePresent"
        >
            <Icon class="icon-small" name="webcam" />
        </button>

        <button
            v-if="state.connected && state.permissions.present"
            class="btn btn-menu"
            :class="{active: state.muted}"
            @click="toggleMute"
        >
            <Icon class="icon-small" :name="state.muted ? 'micMute' : 'mic'" />
        </button>

        <button
            v-if="state.connected && state.permissions.present"
            class="btn btn-menu"
            :class="{active: state.upMedia.screenshare.length}"
            @click="toggleShare"
        >
            <Icon class="icon-small" name="screenshare" />
        </button>

        <button
            v-if="state.connected"
            class="btn btn-menu"
            @click="disconnect"
        >
            <Icon class="icon-small" name="logout" />
        </button>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            state: app.state
        }
    },
    methods: {
        disconnect() {
            app.disconnect()
        },
        toggleMute() {
            this.state.muted = !this.state.muted
            app.muteLocalTracks(this.state.muted)
        },
        togglePresent() {
            if (this.state.upMedia.local.length) {
                app.logger.debug('switching present mode off')
                app.delUpMediaKind('local')

            } else {
                app.logger.debug('switching present mode on')
                let id = app.findUpMedia('local')
                if(!id) {
                    app.addLocalMedia()
                }
            }
        },
        toggleShare() {
            if (this.state.upMedia.screenshare.length) {
                app.logger.debug('switching screenshare off')
                app.delUpMediaKind('screenshare')
            } else {
                app.logger.debug('switching screenshare on')
                app.addShareMedia()
            }
        }
    }
}
</script>

<style lang="postcss">
.c-controls {
    background: var(--grey-200);
    display: flex;
    flex-direction: column;
}
</style>