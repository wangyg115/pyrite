<template>
    <div ref="root" class="c-stream" :class="{'audio': !modelValue.hasVideo}">
        <video
            ref="media"
            :autoplay="true"
            class="media"
            :class="{'loading': loading, 'media-failed': mediaFailed, mirror: modelValue.mirror}"
            :muted="modelValue.direction === 'up'"
            :playsinline="true"
        />

        <transition name="loading-transition">
            <div v-if="loading" class="loading-container">
                <Icon class="spinner" name="Spinner" />
            </div>
            <div v-else-if="!modelValue.hasVideo" class="audio-container">
                <Icon name="Mic" />
            </div>
        </transition>

        <Reports v-if="stats.visible" :description="modelValue" @click="toggleStats" />

        <div v-if="controls && !loading" class="stream-bar">
            <div class="buttons">
                <button
                    v-if="pip.enabled" class="btn btn-menu small tooltip"
                    :data-tooltip="$t('picture-in-picture')"
                    @click="setPip"
                >
                    <Icon class="icon-mini" name="Pip" />
                </button>
                <button class="btn btn-menu small tooltip" :data-tooltip="$t('fullscreen')" @click="setFullscreen">
                    <Icon class="icon-mini" name="Fullscreen" />
                </button>
                <button
                    v-if="!loading && controls" class="btn btn-menu small tooltip"
                    :class="{active: stats.visible}"
                    :data-tooltip="$t('stream info')"
                    @click="toggleStats"
                >
                    <Icon class="icon-mini" name="Info" />
                </button>
            </div>

            <div class="user" :class="{'has-audio': audioEnabled}">
                <div class="name">
                    {{ label }}
                </div>
                <div
                    v-if="audioEnabled" key=""
                    class="volume-slider tooltip tooltip-left"
                    :data-tooltip="`${volume.value}% ${$t('audio volume')}`"
                >
                    <FieldSlider v-model="volume" />
                </div>
            </div>

            <SoundMeter
                v-if="audioEnabled" class="soundmeter"
                orientation="vertical"
                :stream="stream"
                :stream-id="stream.id"
            />
        </div>
    </div>
</template>

<script>
import Reports from './Reports.vue'
import SoundMeter from '@/vue/Elements/SoundMeter.vue'

export default {
    beforeUnmount() {
        app.logger.debug(`unmounting stream ${this.modelValue.id}`)
        if (this.$refs.media.src) {
            URL.revokeObjectURL(this.$refs.media.src)
            this.$refs.media.src = null
        }

        this.$refs.media.srcObject = null
    },
    components: {Reports, SoundMeter},
    computed: {
        /**
         * Audio toggle for down streams that have audio.
         */
        audioEnabled() {
            const audioEnabled = !!(this.modelValue.direction === 'down' && (this.modelValue.hasAudio && this.stream))
            return audioEnabled
        },
        fullscreenEnabled() {
            if (this.$refs.media) {
                return this.$refs.media.requestFullscreen
            }
            return false
        },
        pipEnabled() {
            if (this.$refs.media) {
                return this.$refs.media.requestPictureInPicture
            }
            return false
        },
        volume: {
            get() { return this.modelValue.volume },
            set(volume) { this.$emit('update:modelValue', {...this.modelValue, volume}) },
        },
    },
    data() {
        return {
            label: '',
            loading: true,
            media: null,
            mediaFailed: false,
            muted: false,
            pip: {
                active: false,
                enabled: false,
            },
            stats: {
                visible: false,
            },
            stream: null,
            type: 'video',
        }
    },
    emits: ['update:modelValue'],
    methods: {
        loadSettings() {
            app.logger.debug('retrieving stream settings')
            const settings = {}
            const audioTracks = this.stream.getAudioTracks()
            if (audioTracks.length) settings.audio = audioTracks[0].getSettings()

            const videoTracks = this.stream.getVideoTracks()
            if (videoTracks.length) settings.video = videoTracks[0].getSettings()

            if (!audioTracks.length && !videoTracks.length) {
                app.logger.warn('no audio & video settings found; stream not ready yet?')
            }

            this.$emit('update:modelValue', {...this.modelValue, settings})
        },
        /**
         * Handle mounting a remote 'down' stream.
         */
        mountDownstream() {
            app.logger.debug(`mount downstream ${this.modelValue.id}`)

            this.glnStream = app.connection.down[this.modelValue.id]
            this.stream = this.glnStream.stream

            // No need for further setup; this is an existing stream.
            if (app.connection.down[this.modelValue.id].stream) {
                this.$refs.media.srcObject = app.connection.down[this.modelValue.id].stream
                this.$refs.media.play().catch(e => {
                    app.notifier.notify({level: 'error', message: e})
                })
                return
            }

            this.label = this.glnStream.username

            this.glnStream.ondowntrack = (track) => {
                if (!this.stream) {
                    this.stream = this.glnStream.stream
                }

                app.logger.debug(`downstream ondowntrack/${this.glnStream.id}`)
                // An incoming audio-track; enable volume controls.
                if (track.kind === 'audio') {
                    app.logger.debug(`stream ondowntrack - enable audio controls`)
                    this.$emit('update:modelValue', {...this.modelValue, hasAudio: true})
                } else if(track.kind === 'video') {
                    this.$emit('update:modelValue', {...this.modelValue, hasVideo: true})
                }
            }

            this.glnStream.onlabel = (label) => {
                this.label = label
            }

            this.glnStream.onstatus = async(status) => {
                if(['connected', 'completed'].includes(status)) {

                    this.$refs.media.srcObject = this.stream
                    if (this.audioEnabled) {
                        app.logger.debug(`set stream sink: ${app.$s.devices.audio.selected.id}`)
                        this.$refs.media.setSinkId(app.$s.devices.audio.selected.id)
                    }

                    try {
                        await this.$refs.media.play()
                    } catch (message) {
                        app.notifier.notify({level: 'error', message})
                    }

                    this.loadSettings()
                }
            }
        },
        mountUpstream() {
            // Mute local streams, so people don't hear themselves talk.
            if (!this.muted) {
                this.toggleMuteVolume()
            }
            app.logger.debug(`mount upstream ${this.modelValue.id}`)
            this.label = `${this.$s.user.username} (${this.$t('you')})`

            if (!this.modelValue.src) {
                // Local media stream from a device.
                this.glnStream = app.connection.up[this.modelValue.id]
                this.stream = this.glnStream.stream
                this.$refs.media.srcObject = this.stream
            } else {
                // Local media stream playing from a file...
                if (this.modelValue.src instanceof File) {
                    const url = URL.createObjectURL(this.modelValue.src)

                    if (this.$refs.media.captureStream) {
                        this.stream = this.$refs.media.captureStream()
                    } else if (this.$refs.media.mozCaptureStream) {
                        this.stream = this.$refs.media.mozCaptureStream()
                    }

                    this.glnStream = app.connection.up[this.modelValue.id]
                    this.glnStream.userdata.play = true

                    this.stream.onaddtrack = (e) => {
                        const track = e.track

                        if (track.kind === 'audio') {
                            this.$emit('update:modelValue', {...this.modelValue, hasAudio: true})
                        } else if (track.kind === 'video') {
                            this.$emit('update:modelValue', {...this.modelValue, hasVideo: true})
                        }

                        this.glnStream.pc.addTrack(track, this.stream)
                    }

                    this.glnStream.onclose = () =>{
                        app.logger.info('revoking file-stream url')
                        URL.revokeObjectURL(this.$refs.media.src)
                        this.$refs.media.src = null
                    }

                    this.$refs.media.src = url
                } else if (this.modelValue.src instanceof MediaStream) {
                    // Local MediaStream (not part of Galene); e.g. Webcam test
                    this.stream = this.modelValue.src
                    this.$refs.media.srcObject = this.stream
                } else {
                    throw new Error('invalid Stream source type')
                }
            }

            this.loadSettings()

            // A local stream that's not networked (e.g. cam preview in ettings)
            if (!this.glnStream) return

            this.glnStream.stream = this.stream
        },
        setFullscreen() {
            this.$refs.media.requestFullscreen()
        },
        setPip() {
            if (this.pip.active) {
                document.exitPictureInPicture()
            } else {
                this.$refs.media.requestPictureInPicture()
            }
        },
        toggleMuteVolume() {
            this.muted = !this.muted
            this.$refs.media.muted = this.muted
        },
        toggleStats() {
            this.stats.visible = !this.stats.visible
        },
    },
    mounted() {
        // Firefox doesn't support this API (yet).
        if (this.$refs.media.requestPictureInPicture) {
            this.pip.enabled = true

            this.$refs.media.addEventListener('enterpictureinpicture', () => { this.pip.active = true })
            this.$refs.media.addEventListener('leavepictureinpicture', () => { this.pip.active = false })
        }

        this.muted = this.$refs.media.muted

        this.$refs.media.addEventListener('playing', () => {
            this.loading = false
        })

        if (this.modelValue.direction === 'up') this.mountUpstream()
        else this.mountDownstream()

    },
    props: {
        controls: {
            default() {return true},
            type: Boolean,
        },
        modelValue: {
            required: true,
            type: Object,
        },
    },
    watch: {
        'modelValue.volume.value'(value) {
            this.$refs.media.volume = value / 100
        },
    },
}
</script>

<style lang="scss">
.loading-transition-enter-active,
.loading-transition-leave-active {
    transition: opacity 0.5s;
}

.loading-transition-enter,
.loading-transition-leave-to {
    opacity: 0;
}

@keyframes spinner {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.c-stream {
    background: var(--grey-3);
    display: flex;
    flex-direction: column;
    justify-items: center;
    position: relative;

    video {
        aspect-ratio: 4 / 3;
        border: 2px solid var(--grey-4);
        max-height: 100%;
        object-fit: cover;
        opacity: 1;
        transition: opacity 0.3s;

        &.loading {
            opacity: 0;
        }
    }

    // No video-track; just use it to play audio, but show a
    // mic icon to indicate this is audio-only.

    &.audio {
        video: {
            display: none;
        }
    }

    .audio-container,
    .loading-container {
        align-items: center;
        aspect-ratio: 4 / 3;
        background: var(--grey-2);
        border: 2px solid var(--grey-4);
        display: flex;
        height: 100%;
        justify-content: center;
        object-fit: cover;
        position: absolute;
        width: 100%;

        .icon {
            filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 40%));
            height: 50%;
            width: 50%;
        }

        .spinner {
            animation-duration: 0.75s;
            animation-iteration-count: infinite;
            animation-name: spinner;
        }
    }

    .audio-container {

        .icon {
            color: var(--grey-6);
        }
    }

    .loading-container {

        .icon {
            color: var(--primary-color);
        }
    }

    .stream-bar {
        align-items: center;
        background: var(--grey-3);
        border-top: 1px solid var(--grey-4);
        bottom: 0;
        display: flex;
        position: absolute;
        width: 100%;

        .soundmeter {
            background: var(--grey-3);
            border: 0;
            height: var(--space-3);
            margin: 0;
            width: 1px;
        }

        .buttons {
            display: flex;
        }

        .user {
            align-items: center;
            color: var(--primary-color);
            display: flex;
            flex: 1;
            font-family: var(--font-secondary);
            font-size: var(--text-small);
            font-weight: 600;
            height: var(--space-3);
            justify-content: flex-end;

            .name {
                padding-right: calc(var(--spacer) * 2);
                text-align: right;
                text-transform: uppercase;
            }

            &.has-audio {

                .name {
                    margin-right: var(--spacer);
                }
            }

            .volume-slider {
                bottom: 2px;
                height: var(--spacer);
                position: absolute;

                &.tooltip-left::after {
                    margin-top: -100px;
                    position: absolute;
                }

                input[type="range"] {
                    // Cut off the top/bottom borders.
                    border-left: 0;
                    border-right: 0;
                    bottom: 0;
                    position: absolute;
                    right: 0;
                    transform: rotate(-90deg) translate(18px, 20px);

                    // This is actually the height (rotated).
                    width: var(--space-3);
                }
            }
        }
    }
}
</style>
