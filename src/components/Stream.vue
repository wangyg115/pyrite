<template>
    <div class="c-stream">
        <div class="controls">
            <button class="btn btn-menu tooltip" :data-tooltip="$t('picture-in-picture')" @click="setPip">
                <Icon class="icon-mini" name="pip" />
            </button>
            <button class="btn btn-menu tooltip" :data-tooltip="$t('fullscreen')" @click="setFullscreen">
                <Icon class="icon-mini" name="fullscreen" />
            </button>
        </div>
        <video
            ref="media"
            :autoplay="true"
            class="media"
            :class="{'media-failed': mediaFailed, mirror: peer.mirror,}"
            :muted="peer.isUp"
            :playsinline="true"
        />
        <!-- <div class="video-controls">
            <div class="controls-button controls-left">
                <FieldSlider v-model="volume" />
                <input
                    orient="vertical" step="5"
                    type="range"
                    @change="setVolume"
                >
            </div>
            <div class="controls-button controls-right">
                <span
                    v-if="pipEnabled" class="pip"
                    title="Picture In Picture"
                    @click="setPip"
                >
                    <i aria-hidden="true" class="far fa-clone" />
                </span>
                <span
                    v-if="fullscreenEnabled" class="fullscreen"
                    title="Fullscreen"
                    @click="setFullscreen"
                >
                    <i aria-hidden="true" class="fas fa-expand" />
                </span>
            </div>
        </div> -->
        <!-- <div class="label">
            {{ label }}
        </div> -->
    </div>
</template>

<script>
const activityDetectionInterval = 200
const activityDetectionPeriod = 700
const activityDetectionThreshold = 0.2

export default {
    props: {
        peer: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            label: '',
            media: null,
            mediaFailed: false,
            muted: false,
            pipActive: false,
            stream: null,
            state: app.state,
            volume: 1
        }
    },
    computed: {
        fullscreenEnabled() {
            if (this.media) return this.media.requestFullscreen
            return false
        },
        pipEnabled() {
            if (this.media) return this.media.requestPictureInPicture
            return false
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
        this.media = this.$refs.media

        this.$refs.media.addEventListener('enterpictureinpicture', () => {
            this.pipActive = true
        })

        this.$refs.media.addEventListener('leavepictureinpicture', () => {
            this.pipActive = false
        })

        this.muted = this.media.muted

        if (this.peer.src) {
            let url = URL.createObjectURL(this.peer.src)
            this.$refs.media.src = url
            this.stream = this.$refs.media.captureStream()
            const c = app.connection.up[this.peer.id]
            c.stream = this.stream

            this.stream.onaddtrack = (e) => {
                let t = e.track
                if(t.kind === 'audio') {
                    let presenting = !!app.findUpMedia('local')

                    if(presenting && !this.state.localMute) {
                        app.muteLocalTracks(true)
                        app.displayWarning('You have been muted')
                    }
                }

                c.pc.addTrack(t, this.stream)
                c.labels[t.id] = t.kind
            }

            this.stream.onremovetrack = (e) => {
                let t = e.track
                delete(c.labels[t.id])

                /** @type {RTCRtpSender} */
                let sender
                c.pc.getSenders().forEach(s => {
                    if(s.track === t) {
                        sender = s
                    }
                })
                if(sender) {
                    c.pc.removeTrack(sender)
                } else {
                    console.warn('Removing unknown track')
                }

                if(Object.keys(c.labels).length === 0) {
                    this.stream.onaddtrack = null
                    this.stream.onremovetrack == null
                    app.delUpMedia(c)
                }
            }
        }

        else if (this.peer.isUp) {
            this.$refs.media.srcObject = app.connection.up[this.peer.id].stream
            this.stream = app.connection.up[this.peer.id]
            this.stream.onstats = this.gotUpStats.bind(this, this.stream)
            this.stream.setStatsInterval(2000)
        } else {
            // Downstream:
            this.$refs.media.srcObject = app.connection.down[this.peer.id].stream
            this.stream = app.connection.down[this.peer.id]
            this.stream.onstats = this.gotDownStats

            this.stream.ondowntrack = (track, transceiver, label, stream) => {
                app.logger.debug(`stream event - ondowntrack [${this.stream.id}]`)
                this.$refs.media.srcObject = this.stream.stream
                this.$refs.media.play()
            }

            this.stream.onlabel = (label) => {
                this.label = label
            }

            if(this.state.activityDetection) {
                this.stream.setStatsInterval(activityDetectionInterval)
            }
        }

        this.stream.onstatus = (status) => {
            this.setMediaStatus()
        }

        this.setMediaStatus()

    },
    methods: {
        /**
         * @this {Stream}
         * @param {Object<string,any>} stats
         */
        gotDownStats(stats) {
            if(!getInputElement('activitybox').checked)
                return

            let c = this

            let maxEnergy = 0

            c.pc.getReceivers().forEach(r => {
                let tid = r.track && r.track.id
                let s = tid && stats[tid]
                let energy = s && s['track'] && s['track'].audioEnergy
                if(typeof energy === 'number')
                    maxEnergy = Math.max(maxEnergy, energy)
            })

            // totalAudioEnergy is defined as the integral of the square of the
            // volume, so square the threshold.
            if(maxEnergy > activityDetectionThreshold * activityDetectionThreshold) {
                c.userdata.lastVoiceActivity = Date.now()
                setActive(c, true)
            } else {
                let last = c.userdata.lastVoiceActivity
                if(!last || Date.now() - last > activityDetectionPeriod) {
                    setActive(c, false)
                }
            }
        },
        /**
         * @this {Stream}
         * @param {Object<string,any>} stats
         */
        gotUpStats(c, stats) {
            let text = ''

            this.stream.pc.getSenders().forEach(s => {
                let tid = s.track && s.track.id
                let stats = tid && this.stream.stats[tid]
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
                this.media.requestPictureInPicture()
            }
        },
        setFullscreen() {
            this.media.requestFullscreen()
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
        setVolume(e) {
            this.media.volume = parseInt(e.target.value, 10) / 100
        },
        toggleMuteVolume() {
            this.muted = !this.muted
            this.media.muted = this.muted
        }
    }
}
</script>
<style lang="postcss">
.c-stream {
    display: flex;
    position: relative;

    & .controls {
        background: rgba(0, 0, 0, 0.5);
        height: 100%;
        left: 0;
        position: absolute;
        width: var(--space-4);
        z-index: 1000;
    }

    & video {
        height: 100%;
        object-fit: cover;
        width: 100%;
    }

}
</style>