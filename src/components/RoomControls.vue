<template>
    <nav class="c-controls">
        <div class="group-controls">
            <button
                v-if="state.permissions.present"
                class="btn btn-menu tooltip tooltip-left"
                :class="{active: !state.muted, warning: state.muted}"
                :data-tooltip="state.muted ? $t('unmute microphone'): $t('mute microphone')"
                @click="toggleMute"
            >
                <Icon class="icon-small" name="mic" />
            </button>

            <button
                v-if="state.permissions.present"
                class="btn btn-menu tooltip tooltip-left"
                :class="{active: state.upMedia.local.length, warning: !state.upMedia.local.length}"
                :data-tooltip="`${$t('switch camera')} ${state.upMedia.local.length ? $t('off') : $t('on')}`"
                @click="togglePresent"
            >
                <Icon class="icon-small" name="webcam" />
            </button>

            <button
                v-if="state.permissions.present"
                class="btn btn-menu tooltip tooltip-left"
                :class="{active: state.upMedia.screenshare.length}"
                :data-tooltip="`${$t('switch screensharing')} ${state.upMedia.screenshare.length ? $t('off') : $t('on')}`"
                @click="toggleShare"
            >
                <Icon class="icon-small" name="screenshare" />
            </button>

            <button
                v-if="state.permissions.present"
                class="btn btn-menu tooltip tooltip-left"
                :class="{active: state.upMedia.video.length}"
                :data-tooltip="playFiles"
            >
                <FieldFile v-model="playFiles" @file="togglePlayFile" />
            </button>

            <button class="btn btn-menu no-feedback tooltip tooltip-left" :data-tooltip="`${$t('master audio volume')} ${volume}`">
                <FieldSlider v-model="volume" />
            </button>
        </div>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            playFiles: [],
            state: app.state,
            volume: 100
        }
    },
    watch: {
        volume(volume) {
            for (const description of this.state.streams) {
                description.volume = volume
            }
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
        async toggleShare() {
            if (this.state.upMedia.screenshare.length) {
                app.logger.debug('turn screenshare stream off')
                app.stopUpMedia(this.screenStream)
            } else {
                app.logger.debug('turn screenshare stream on')
                this.screenStream = await app.addShareMedia()
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