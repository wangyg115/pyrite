<template>
    <section class="c-tab-devices tab-content active">
        <div class="camera-field">
            <FieldSelect
                v-model="$s.devices.cam.selected"
                :help="$t('change the active video device')"
                :label="$t('video camera')"
                name="video"
                :options="$s.devices.cam.options"
            />

            <div v-if="$s.group.connected" class="field connected-warning">
                <Icon class="icon icon-small" name="Warning" />
                {{ $t('You are currently streaming to other people') }}
            </div>
            <Stream v-if="description" v-model="description" :controls="false" />
        </div>

        <FieldSelect
            v-model="$s.devices.cam.resolution"
            :help="$t('supported resolutions depend on the device capabilities')"
            :label="$t('preferred resolution')"
            name="resolution"
            :options="resolutionOptions"
        />

        <FieldSelect
            v-model="$s.devices.mic.selected"
            :help="$t('verify the microphone is working with the soundmeter')"
            :label="$t('microphone')"
            name="audio"
            :options="$s.devices.mic.options"
        />

        <div class="soundmeter">
            <SoundMeter v-if="streamId && stream" :stream="stream" :stream-id="streamId" />
        </div>

        <div class="output-config">
            <!-- https://bugzilla.mozilla.org/show_bug.cgi?id=1498512 -->
            <!-- https://bugzilla.mozilla.org/show_bug.cgi?id=1152401 -->
            <FieldSelect
                v-if="$s.devices.audio.options.length && !app.env.isFirefox"
                v-model="$s.devices.audio.selected"
                :help="$t('verify your audio configuration with the test sound')"
                :label="$t('audio output')"
                name="audio"
                :options="$s.devices.audio.options"
            >
                <template #header>
                    <button class="btn" :disabled="sound.audio.playing" @click="soundAudio.play()">
                        <Icon class="icon-small" name="Play" />
                    </button>
                </template>
            </FieldSelect>
            <div v-else class="field">
                <div class="label-container">
                    <label class="field-label uc">{{ $t('audio output') }}</label>
                    <button class="btn" :disabled="sound.audio.playing" @click="soundAudio.play()">
                        <Icon class="icon-small" name="Play" />
                    </button>
                </div>

                <div class="help ucfl">
                    {{ $t('verify your audio configuration with the test sound') }}
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import {nextTick} from 'vue'
import Sound from '@/js/lib/sound.js'
import Stream from '@/vue/Conference/Groups/Group/Stream/Stream.vue'

export default {
    beforeUnmount() {
        if (!this.$s.group.connected) {
            this.$m.sfu.delLocalMedia()
        }
    },
    components: {Stream},
    data() {
        return {
            description: null,
            // Keep track of test sounds that are playing.
            playing: {
                audio: false,
            },
            resolutionOptions: [
                {
                    id: 'default',
                    name: this.$t('default'),
                },
                {
                    id: '720p',
                    name: this.$t('hd - 720p (1280x720)'),
                },
                {
                    help: this.$t('full hd video requires excessive bandwidth!'),
                    id: '1080p',
                    name: this.$t('full hd - 1080p (1920x1080)'),
                },
            ],
            sound: {
                audio: {
                    file: '/audio/power-on.ogg',
                    playing: false,
                },
            },
            stream: null,
            streamId: null,
        }
    },
    methods: {
        async remountStream() {
            this.stream = await this.$m.media.getUserMedia()
            this.streamId = this.stream.id
            this.description = null
            // Give the stream time to unmount first...
            await nextTick()

            this.description = {
                direction: 'up',
                hasAudio: this.$s.devices.mic.enabled,
                hasVideo: this.$s.devices.cam.enabled,
                id: this.stream.id,
                kind: 'video',
                mirror: false,
                src: this.stream,
                volume: {
                    locked: false,
                    value: 100,
                },
            }
        },
        testSoundAudio() {
            this.soundAudio.play()
        },
    },
    async mounted() {
        await this.$m.media.queryDevices()
        this.soundAudio = new Sound(this.sound.audio)

        // Not a media stream yet? Create one for the audio settings
        if (!this.$s.group.connected) {
            const res = await this.$m.media.getUserMedia()
            if (!res) {
                this.app.notifier.notify({level: 'error', message: 'Unable to find a valid device'})
                return
            }
        }
        this.stream = this.$m.media.localStream
        this.streamId = this.$m.media.localStream.id
        this.description = {
            direction: 'up',
            hasAudio: this.$s.devices.mic.enabled,
            hasVideo: this.$s.devices.cam.enabled,
            id: this.stream.id,
            kind: 'video',
            mirror: false,
            src: this.stream,
            volume: {
                locked: false,
                value: 100,
            },
        }
    },
    watch: {
        '$s.devices.cam.resolution'() {
            this.remountStream()
        },
        '$s.devices.cam.selected'() {
            this.remountStream()
        },
        '$s.devices.mic.selected'() {
            this.remountStream()
        },
    },
}
</script>

<style lang="scss">
.c-tab-devices {

    .connected-warning {
        align-items: center;
        display: flex;
        font-family: var(--font-secondary);

        .icon {
            color: var(--warning-color);
            margin-right: var(--spacer);
        }
    }

    .camera-field {
        display: flex;
        flex-direction: column;

        .c-stream {
            border: var(--border) solid var(--grey-5);
            margin: var(--spacer) 0;
            right: 0;
            width: 180px;
        }
    }

    .soundmeter {

        canvas {
            margin: 0;
        }
    }

    .output-config {
        align-content: center;
        align-items: center;
        display: flex;
    }
}

</style>
