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
                @click="toggleMicrophone"
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

            <button
                v-if="$s.permissions.present"
                class="btn btn-menu tooltip tooltip-left"
                :class="{active: $s.user.status.raisehand}"
                data-tooltip="Raise your hand"
                @click="toggleRaiseHand"
            >
                <Icon class="icon-small" name="Hand" />
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
        toggleCam() {
            this.$s.devices.cam.enabled = !this.$s.devices.cam.enabled
            app.logger.debug(`switching cam stream: ${this.$s.devices.cam.enabled}`)
            app.delUpMediaKind('camera')
            app.getUserMedia(this.$s.devices)
        },
        toggleMicrophone() {
            app.muteMicrophone(this.$s.devices.mic.enabled)
        },
        togglePlayFile(file) {
            if (file) {
                app.addFileMedia(file)
            } else {
                this.playFiles = []
                app.delUpMediaKind('video')
            }
        },
        toggleRaiseHand() {
            app.connection.userAction('setstatus', app.connection.id, {
                raisehand: !this.$s.user.status.raisehand,
            })
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
