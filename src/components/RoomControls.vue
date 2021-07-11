<template>
    <nav class="c-room-controls">
        <div class="group-controls">
            <button class="btn btn-menu no-feedback tooltip tooltip-left" :data-tooltip="`${volume.value}% ${$t('audio volume')}`">
                <FieldSlider v-model="volume" />
            </button>

            <button
                v-if="$s.permissions.present"
                class="btn btn-menu tooltip tooltip-left"
                :class="{active: $s.devices.mic.enabled, warning: !$s.devices.mic.enabled}"
                :data-tooltip="`${$t('switch microphone')} ${$s.devices.mic.enabled ? $t('off') : $t('on')}`"
                @click="toggleMic"
            >
                <Icon class="icon-small" name="Mic" />
            </button>

            <button
                v-if="$s.permissions.present"
                class="btn btn-menu tooltip tooltip-left"
                :class="{active: $s.devices.cam.enabled, warning: !$s.devices.cam.enabled}"
                :data-tooltip="`${$t('switch camera')} ${$s.devices.cam.enabled ? $t('off') : $t('on')}`"
                @click="toggleCam"
            >
                <Icon class="icon-small" name="Webcam" />
            </button>

            <button
                v-if="$s.permissions.present"
                class="btn btn-menu tooltip tooltip-left"
                :class="{active: $s.upMedia.screenshare.length}"
                :data-tooltip="`${$t('switch screensharing')} ${$s.upMedia.screenshare.length ? $t('off') : $t('on')}`"
                @click="toggleScreenshare"
            >
                <Icon class="icon-small" name="ScreenShare" />
            </button>

            <button
                v-if="$s.permissions.present"
                class="btn btn-menu tooltip tooltip-left"
                :class="{active: $s.upMedia.video.length}"
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
            volume: {
                locked: null,
                value: 100,
            },
        }
    },
    methods: {
        disconnect() {
            app.disconnect()
        },
        toggleCam() {
            this.$s.devices.cam.enabled = !this.$s.devices.cam.enabled
            app.logger.debug(`switching cam stream: ${this.$s.devices.cam.enabled}`)
            app.delUpMediaKind('local')
            app.addLocalMedia(this.$s.devices)
        },
        toggleMic() {
            this.$s.devices.mic.enabled = !this.$s.devices.mic.enabled
            app.logger.debug(`mic track enabled: ${this.$s.devices.mic.enabled}`)
            app.muteLocalTracks(this.$s.devices.mic.enabled)

        },
        togglePlayFile(file) {
            if (file) {
                app.addFileMedia(file)
            } else {
                this.playFiles = []
                app.delUpMediaKind('video')
            }
        },
        async toggleScreenshare() {
            if (this.$s.upMedia.screenshare.length) {
                app.logger.debug('turn screenshare stream off')
                app.delUpMedia(this.screenStream)
            } else {
                app.logger.debug('turn screenshare stream on')
                this.screenStream = await app.addShareMedia()
            }
        },
    },
    watch: {
        volume(volume) {
            for (const description of this.$s.streams) {
                // Only downstreams have volume control:
                if (description.direction === 'down' && !description.volume.locked) {
                    description.volume = volume
                }
            }
        },
    },
}
</script>

<style lang="scss">
.c-room-controls {
    background: var(--grey-400);
    border-left: var(--border) solid var(--grey-300);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>
