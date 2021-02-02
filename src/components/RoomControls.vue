<template>
    <nav class="c-controls">
        <div class="group-controls">
            <button
                v-if="state.permissions.present"
                class="btn btn-menu tooltip"
                :class="{active: !state.muted, warning: state.muted}"
                :data-tooltip="$t('mute microphone')"
                @click="toggleMute"
            >
                <Icon class="icon-small" name="mic" />
            </button>

            <button
                v-if="state.permissions.present"
                class="btn btn-menu tooltip"
                :class="{active: state.upMedia.local.length, warning: !state.upMedia.local.length}"
                :data-tooltip="`${$t('switch camera')} ${state.upMedia.local.length ? $t('off') : $t('on')}`"
                @click="togglePresent"
            >
                <Icon class="icon-small" name="webcam" />
            </button>

            <button
                v-if="state.permissions.present"
                class="btn btn-menu tooltip"
                :class="{active: state.upMedia.screenshare.length}"
                :data-tooltip="`${$t('switch screensharing')} ${state.upMedia.screenshare.length ? $t('off') : $t('on')}`"
                @click="toggleShare"
            >
                <Icon class="icon-small" name="screenshare" />
            </button>

            <button
                v-if="state.permissions.present"
                class="btn btn-menu tooltip"
                :class="{active: state.upMedia.video.length}"
                :data-tooltip="playFiles"
            >
                <FieldFile v-model="playFiles" @file="togglePlayFile" />
            </button>
        </div>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            playFiles: [],
            state: app.state
        }
    },
    methods: {
        disconnect() {
            app.disconnect()
        },
        toggleMute() {
            app.muteLocalTracks(!this.state.muted)
        },
        togglePlayFile(file) {
            if (file) {
                app.addFileMedia(file)
            } else {
                this.playFiles = []
                console.log("plAYFILES", this.playFiles)
                app.delUpMediaKind('video')
            }
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
    background: var(--grey-400);
    border-right: var(--border) solid var(--grey-300);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>