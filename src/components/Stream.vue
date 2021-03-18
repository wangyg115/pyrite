<template>
    <div class="c-stream">
        <div class="video-container">
            <video
                ref="media"
                :autoplay="true"
                class="media"
                :class="{'media-failed': mediaFailed, mirror: modelValue.mirror, 'activity-detected': activityDetected}"
                :muted="modelValue.isUp"
                :playsinline="true"
            />
        </div>

        <div v-if="controls" class="stream-bar">
            <div class="buttons">
                <button class="btn btn-menu tooltip" :data-tooltip="$t('picture-in-picture')" @click="setPip">
                    <Icon class="icon-mini" name="pip" />
                </button>
                <button class="btn btn-menu tooltip" :data-tooltip="$t('fullscreen')" @click="setFullscreen">
                    <Icon class="icon-mini" name="fullscreen" />
                </button>
            </div>
            <div class="about">
                {{ label }}
            </div>
            <button v-if="hasAudio" class="btn btn-menu no-feedback tooltip tooltip-left" :data-tooltip="`${$t('audio volume')} ${volume.value}`">
                <FieldSlider v-model="volume" />
            </button>
            <SoundMeter
                v-if="hasAudio && stream" class="soundmeter"
                orientation="vertical"
                :stream="stream"
                :stream-id="stream.id"
            />
        </div>
    </div>
</template>
<script>
import SoundMeter from './ui/SoundMeter.vue'

export default {
    components: {SoundMeter},
    props: {
        controls: {
            type: Boolean,
            default() {return true}
        },
        modelValue: {
            type: Object,
            required: true
        }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            activityDetected: false,
            hasAudio: false,
            label: '',
            media: null,
            mediaFailed: false,
            muted: false,
            pipActive: false,
            stream: null,
            state: app.state,
        }
    },
    computed: {
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
        /**
         * Indirectly map props to state in order to modify volume.
         * May be a bit hacky, but allows setters without emitting
         * events upwards.
         */
        volume: {
            get() { return this.modelValue.volume },
            set(volume) { this.$emit('update:modelValue', {...this.modelValue, volume}) }
        }
    },
    watch: {
        'modelValue.volume.value'(value) {
            this.$refs.media.volume = value / 100
        }
    },
    beforeUnmount() {
        if (this.$refs.media.src) {
             URL.revokeObjectURL(this.$refs.media.src)
             this.$refs.media.src = null
        }

        this.$refs.media.srcObject = null
    },
    mounted() {
        this.$refs.media.addEventListener('enterpictureinpicture', () => { this.pipActive = true })
        this.$refs.media.addEventListener('leavepictureinpicture', () => { this.pipActive = false })

        this.muted = this.$refs.media.muted

        if (this.modelValue.isUp) {
            if (this.modelValue.src) {
                // Networked stream from local file
                if (this.modelValue.src instanceof File) {
                    this.stream = this.$refs.media.captureStream()
                    this.glnStream = app.connection.up[this.modelValue.id]
                    this.glnStream.onclose = function(replace) {
                        stopStream(this.stream)
                        app.logger.info('revoling file-stream url')
                        URL.revokeObjectURL(this.$refs.media.src)
                        this.$refs.media.src = null
                    }

                    let url = URL.createObjectURL(this.modelValue.src)
                    this.$refs.media.src = url
                // Local MediaStream (not part of Galene); e.g. Webcam test
                } else if (this.modelValue.src instanceof MediaStream) {
                    this.stream = this.modelValue.src
                } else {
                    throw new Error('invalid Stream source type')
                }
            } else {
                // Networked video camera stream; dealt with by addLocalMedia.
                this.glnStream = app.connection.up[this.modelValue.id]
                this.stream = this.glnStream.stream
            }

            // Networked? add stream object
            if (this.glnStream) {
                this.glnStream.stream = this.stream
                this.glnStream.onstats = this.gotUpStats.bind(this)
                this.glnStream.setStatsInterval(1000)

                this.stream.onaddtrack = (e) => {
                    let t = e.track
                    this.glnStream.pc.addTrack(t, this.stream)
                    this.glnStream.labels[t.id] = t.kind
                }

                this.stream.onremovetrack = (e) => {
                    delete(this.glnStream.labels[e.track.id])

                    /** @type {RTCRtpSender} */
                    this.glnStream.pc.getSenders().forEach(s => {
                        if(s.track === e.track) {
                            app.logger.info('removing sender track')
                            this.glnStream.pc.removeTrack(s.track)
                        }
                    })

                    if(Object.keys(this.glnStream.labels).length === 0) {
                        this.stream.onaddtrack = null
                        this.stream.onremovetrack == null
                        app.stopUpMedia(this.glnStream)
                    }
                }
            }

            this.$refs.media.srcObject = this.stream
        } else {
            // Networked down stream
            this.glnStream = app.connection.down[this.modelValue.id]
            this.stream = this.glnStream.stream

            if(this.state.activityDetection) {
                this.glnStream.onstats = this.gotDownStats
                this.glnStream.setStatsInterval(1000)
            }

            this.label = this.glnStream.username

            this.glnStream.ondowntrack = (track, transceiver, label, stream) => {
                app.logger.debug(`stream ondowntrack - [${this.glnStream.id}]`)
                // An incoming audio-track; enable volume controls.
                if (track.kind === 'audio') {
                    app.logger.debug(`stream ondowntrack - enable audio controls`)
                    this.hasAudio = true
                }

                if (!this.stream) {
                    this.stream = stream
                    this.$refs.media.srcObject = this.stream
                    this.$refs.media.play()
                }
            }

            this.glnStream.onlabel = (label) => {
                this.label = label
            }

            this.glnStream.onstatus = (status) => {
                this.setMediaStatus()
            }
        }

        this.setMediaStatus()
    },
    methods: {
        gotDownStats(stats) {
            let maxEnergy = 0
            const activityDetectionPeriod = 700
            const activityDetectionThreshold = 0.2

            this.glnStream.pc.getReceivers().forEach(r => {
                let tid = r.track && r.track.id
                let s = tid && stats[tid]
                let energy = s && s['track'] && s['track'].audioEnergy
                if(typeof energy === 'number')
                    maxEnergy = Math.max(maxEnergy, energy)
            })

            // totalAudioEnergy is defined as the integral of the square of the
            // volume, so square the threshold.
            if(maxEnergy > activityDetectionThreshold * activityDetectionThreshold) {
                this.glnStream.userdata.lastVoiceActivity = Date.now()
                this.activityDetected = true
            } else {
                let last = this.glnStream.userdata.lastVoiceActivity
                if(!last || Date.now() - last > activityDetectionPeriod) {
                    this.activityDetected = false
                }
            }
        },

        gotUpStats() {
            let text = ''

            this.glnStream.pc.getSenders().forEach(s => {
                let tid = s.track && s.track.id
                let stats = tid && this.glnStream.stats[tid]
                let rate = stats && stats['outbound-rtp'] && stats['outbound-rtp'].rate
                if(typeof rate === 'number') {
                    if(text) {
                        text = text + ' + '
                    }
                    text = text + Math.round(rate / 1000) + 'kbps'
                }
            })

            this.label = text
        },
        setPip() {
            if (this.pipActive) {
                document.exitPictureInPicture()
            } else {
                this.$refs.media.requestPictureInPicture()
            }
        },
        setFullscreen() {
            this.$refs.media.requestFullscreen()
        },
        setMediaStatus() {
            app.logger.debug('setMediaStatus')
            let state = this.stream && this.stream.pc && this.stream.pc.iceConnectionState
            this.mediaFailed = !(state === 'connected' || state === 'completed')

            if(!this.mediaFailed) {
                if(this.stream.userdata.play) {
                    this.$refs.media.play().catch(e => {
                        console.error(e)
                        this.displayError(e)
                    })
                    delete(this.stream.userdata.play)
                }
            }
        },
        toggleMuteVolume() {
            this.muted = !this.muted
            this.$refs.media.muted = this.muted
        }
    }
}
</script>
<style lang="postcss">
.c-stream {
    display: flex;
    flex-direction: column;
    justify-items: center;
    position: relative;

    & .video-container {
        height: 0px;
        padding-top: 75%;
        position: relative;

        & video {
            border: 2px solid var(--grey-400);
            height: 100%;
            left: 0;
            object-fit: cover;
            position: absolute;
            top: 0;
            width: 100%;

            &.activity-detected {
                border: 2px solid var(--primary-color);
            }
        }
    }

    & .stream-bar {
        align-items: center;
        background: var(--grey-300);
        border-top: 1px solid var(--grey-300);
        display: flex;

        & .soundmeter {
            background: var(--grey-400);
            border: 0;
            height: var(--space-4);
            margin: 0;
            width: 2px;
        }

        & .buttons {
            display: flex;
        }

        & .about {
            color: var(--grey-200);
            flex: 1;
            font-weight: 600;
            padding-right: var(--spacer);
            text-align: right;
        }
    }

}
</style>