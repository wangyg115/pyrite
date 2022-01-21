<template>
    <nav class="c-room-controls">
        <div class="group-controls">
            <button class="btn btn-menu no-feedback tooltip tooltip-left" :data-tooltip="`${volume.value}% ${$t('audio volume')}`">
                <FieldSlider v-model="volume" />
            </button>

            <button
                v-if="$s.permissions.present"
                class="btn btn-menu tooltip tooltip-left"
                :class="{active: $s.devices.mic.enabled, error: !$s.devices.mic.enabled}"
                :data-tooltip="`${$t('switch microphone')} ${$s.devices.mic.enabled ? $t('off') : $t('on')}`"
                @click="toggleMicrophone"
            >
                <Icon class="icon-small" name="Mic" />
            </button>

            <button
                v-if="$s.permissions.present"
                class="btn btn-menu tooltip tooltip-left mb-1"
                :class="{active: $s.user.status.raisehand}"
                :data-tooltip="$s.user.status.raisehand ? $t('hinting for speaking time') : $t('request speaking time')"
                @click="toggleRaiseHand"
            >
                <Icon class="hand icon-small" :class="{wave: $s.user.status.raisehand}" name="Hand" />
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
                class="btn btn-menu"
                :class="{active: $s.upMedia.video.length}"
            >
                <FieldFile
                    v-model="$s.files.playing"
                    :accept="fileMediaAccept"
                    :tooltip="filePlayTooltip"
                    @file="togglePlayFile"
                />
            </button>
        </div>
    </nav>
</template>

<script>
import app from '@/js/app.js'

export default {
    computed: {
        fileMediaAccept() {
            if (app.env.isFirefox) {
                return '.mp4'
            } else {
                // Chromium supports at least these 3 formats:
                return '.mp4,.mkv,.webm'
            }
        },
        filePlayTooltip() {
            if (this.$s.files.playing.length) {
                return this.$t('streaming video file')
            }
            let formats = []
            if (app.env.isFirefox) {
                formats.push('.mp4')
            } else {
                formats.push('.mp4', 'webm', 'mkv')
            }
            return this.$t('stream video file ({formats})', {formats: formats.join(',')})
        },

    },
    data() {
        return {
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
            app.$m.sfu.delUpMediaKind('camera')
            app.getUserMedia(this.$s.devices)
        },
        toggleMicrophone() {
            app.$m.sfu.muteMicrophone(this.$s.devices.mic.enabled)
        },
        togglePlayFile(file) {
            if (file) {
                app.$m.sfu.addFileMedia(file)
            } else {
                this.$s.files.playing = []
                app.$m.sfu.delUpMediaKind('video')
            }
        },
        toggleRaiseHand() {
            app.$m.sfu.connection.userAction('setstatus', app.$m.sfu.connection.id, {raisehand: !this.$s.user.status.raisehand})
            if (!this.$s.user.status.raisehand) {
                app.notifier.message('raisehand', {source: this.$s.user.name}, null, {chat: true, notification: false})
            }
        },
        async toggleScreenshare() {
            if (this.$s.upMedia.screenshare.length) {
                app.logger.debug('turn screenshare stream off')
                app.$m.sfu.delUpMedia(this.screenStream)
            } else {
                app.logger.debug('turn screenshare stream on')
                this.screenStream = await app.$m.sfu.addShareMedia()
            }
        },
    },
    watch: {
        '$s.devices.mic.enabled'(enabled) {
            app.$m.sfu.connection.userAction('setstatus', app.$m.sfu.connection.id, {mic: enabled})
        },
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
    background: var(--grey-4);
    border-left: var(--border) solid var(--grey-4);
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .hand {

        &.wave {
            animation-duration: 2.5s;
            animation-iteration-count: infinite;
            animation-name: wave-animation;
            transform-origin: center bottom;
        }
    }
}
</style>
