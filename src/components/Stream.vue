<template>
    <div class="c-stream">
        <div v-if="controls" class="controls">
            <button class="btn btn-menu tooltip" :data-tooltip="$t('picture-in-picture')" @click="setPip">
                <Icon class="icon-mini" name="pip" />
            </button>
            <button class="btn btn-menu tooltip" :data-tooltip="$t('fullscreen')" @click="setFullscreen">
                <Icon class="icon-mini" name="fullscreen" />
            </button>
            <button class="btn btn-menu no-feedback tooltip" :data-tooltip="`${$t('audio volume')} ${volume}`">
                <FieldSlider v-model="volume" />
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
    </div>
</template>

<script>
const activityDetectionInterval = 200
const activityDetectionPeriod = 700
const activityDetectionThreshold = 0.2

export default {
    props: {
        controls: {
            type: Boolean,
            default() {return true}
        },
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
            volume: 100
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
        }
    },
    watch: {
        volume(volume) {
            this.$refs.media.volume = volume / 100
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

        if (this.peer.src) {
            if (this.peer.src instanceof File) {
                let url = URL.createObjectURL(this.peer.src)
                this.$refs.media.src = url
                this.stream = this.$refs.media.captureStream()
                this.glnStream = app.connection.up[this.peer.id]
                this.glnStream.stream = this.stream
            } else if (this.peer.src instanceof MediaStream) {
                this.$refs.media.srcObject = this.peer.src
                this.stream = this.peer.src
            }

            this.stream.onaddtrack = (e) => {
                let t = e.track
                if(e.track.kind === 'audio') {
                    let presenting = !!app.findUpMedia('local')

                    if(presenting && !this.state.localMute) {
                        app.muteLocalTracks(true)
                        app.displayWarning('You have been muted')
                    }
                }

                this.glnStream.pc.addTrack(t, this.stream)
                this.glnStream.labels[t.id] = t.kind
            }

            this.stream.onremovetrack = (e) => {
                delete(this.glnStream.labels[e.track.id])

                /** @type {RTCRtpSender} */
                let sender
                this.glnStream.pc.getSenders().forEach(s => {
                    if(s.track === e.track) {
                        sender = s
                    }
                })
                if(sender) {
                    this.glnStream.pc.removeTrack(sender)
                } else {
                    console.warn('Removing unknown track')
                }

                if(Object.keys(this.glnStream.labels).length === 0) {
                    this.stream.onaddtrack = null
                    this.stream.onremovetrack == null
                    app.stopUpMedia(this.glnStream)
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