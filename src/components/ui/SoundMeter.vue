<template>
    <canvas id="meter" ref="meter" />
</template>
<script>

function volumeAudioProcess(event) {
    var buf = event.inputBuffer.getChannelData(0)
    var bufLength = buf.length
    var sum = 0
    var x

    // Do a root-mean-square on the samples: sum up the squares...
    for (var i = 0; i < bufLength; i++) {
        x = buf[i]
        if (Math.abs(x) >= this.clipLevel) {
            this.clipping = true
            this.lastClip = window.performance.now()
        }
        sum += x * x
    }

    // ... then take the square root of the sum.
    var rms = Math.sqrt(sum / bufLength)

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume * this.averaging)
}

function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
    const processor = audioContext.createScriptProcessor(512)
    processor.onaudioprocess = volumeAudioProcess
    processor.clipping = false
    processor.lastClip = 0
    processor.volume = 0.1
    processor.clipLevel = clipLevel || 0.98
    processor.averaging = averaging || 0.95
    processor.clipLag = clipLag || 750

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    processor.connect(audioContext.destination)
    processor.checkClipping = function() {
        if (!this.clipping) return false
        if ((this.lastClip + this.clipLag) < window.performance.now()) this.clipping = false
        return this.clipping
    }

    processor.shutdown = function() {
        this.disconnect()
        this.onaudioprocess = null
    }

    return processor
}



let meter = null

let canvasContext, canvasElement

export default {
    data() {
        return {
            state: app.state
        }
    },
    watch: {
        'devices.ready': async function(isReady) {
            if (isReady) this.updateSoundmeter()
        },
        /**
        * Reinitialize the soundmeter when the
        * input device changes.
        */
        'state.audio.id': async function() {
            this.updateSoundmeter()
        },
    },
    unmounted: function() {
        // Stop the volume meter.
        window.cancelAnimationFrame(this.rafID)
    },
    mounted: async function() {
        canvasElement = this.$refs.meter
        canvasContext = canvasElement.getContext('2d')
        const computedStyle = getComputedStyle(document.querySelector('.theme'))
        this.colors = {
            primary: computedStyle.getPropertyValue('--primary-color'),
            warning: computedStyle.getPropertyValue('--warning-color'),
        }

        try {
            this.audioContext = new AudioContext()
            const localStreamId = app.state.upMedia.local
            const stream = app.connection.up[localStreamId].stream

            const mediaStreamSource = this.audioContext.createMediaStreamSource(stream)
            meter = createAudioMeter(this.audioContext)
            mediaStreamSource.connect(meter)
            this.drawLoop()
             this.updateSoundmeter()

        } catch (err) {
            console.error(err)
        }
    },
    methods: {
        drawLoop: function() {
            canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
            if (meter.checkClipping()) {
                canvasContext.fillStyle = this.colors.warning
            } else {
                canvasContext.fillStyle = this.colors.primary
            }

            canvasContext.fillRect(0, 0, meter.volume * canvasElement.width * 2.4, canvasElement.height)
            this.rafID = window.requestAnimationFrame(this.drawLoop)
        },
        updateSoundmeter: async function() {
            const localStreamId = app.state.upMedia.local
            const stream = app.connection.up[localStreamId].stream

            const mediaStreamSource = this.audioContext.createMediaStreamSource(stream)
            meter = createAudioMeter(this.audioContext)
            mediaStreamSource.connect(meter)
        },
    }
}

</script>
<style lang="postcss">
canvas {
    border: 1px solid var(--grey-300);
    height: var(--spacer);
    margin: var(--spacer);
    max-width: 300px;
    width: 100%;
}
</style>