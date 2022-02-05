<template>
    <canvas id="meter" ref="meter" :class="{[orientation]: true}" />
</template>

<script>
// Based on https://github.com/cwilso/volume-meter/blob/master/volume-meter.js

// The MIT License (MIT)
// Copyright (c) 2014 Chris Wilson
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
import {app} from '@/js/app.js'

function volumeAudioProcess(event) {
    const buf = event.inputBuffer.getChannelData(0)
    const bufLength = buf.length
    let sum = 0
    let x

    for (var i = 0; i < bufLength; i++) {
        x = buf[i]
        if (Math.abs(x) >= this.clipLevel) {
            this.clipping = true
            this.lastClip = window.performance.now()
        }
        sum += x * x
    }

    const rms = Math.sqrt(sum / bufLength)
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
        if ((this.lastClip + this.clipLag) < window.performance.now()) {
            this.clipping = false
        }
        return this.clipping
    }

    processor.shutdown = function() {
        this.disconnect()
        this.onaudioprocess = null
    }

    return processor
}

export default {
    data() {
        return {
            state: app.state,
        }
    },
    methods: {
        drawLoop: function() {
            if (this.orientation === 'horizontal') {
                this.canvasContext.clearRect(0, 0, this.$refs.meter.width, this.$refs.meter.height)
            } else {
                this.canvasContext.clearRect(0, 0, this.$refs.meter.width, this.$refs.meter.height)
            }
            if (this.meter.checkClipping()) {
                this.canvasContext.fillStyle = this.colors.warning
            } else {
                this.canvasContext.fillStyle = this.colors.primary
            }

            if (this.orientation === 'horizontal') {
                this.canvasContext.fillRect(0, 0, this.meter.volume * this.$refs.meter.width * 2.4, this.$refs.meter.height)
            } else {
                this.canvasContext.fillRect(0, 0, this.$refs.meter.width, this.meter.volume * this.$refs.meter.height * 2.4)
            }
            this.rafID = window.requestAnimationFrame(this.drawLoop)
        },
        updateSoundmeter: async function() {
            this.audioContext = new AudioContext()
            const mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream)
            this.meter = createAudioMeter(this.audioContext)
            mediaStreamSource.connect(this.meter)
        },
    },
    mounted: async function() {
        this.canvasContext = this.$refs.meter.getContext('2d')
        const computedStyle = getComputedStyle(document.querySelector('.app'))
        this.colors = {
            primary: computedStyle.getPropertyValue('--primary-color'),
            warning: computedStyle.getPropertyValue('--warning-color'),
        }

        this.updateSoundmeter()
        this.drawLoop()
    },
    props: {
        orientation: {
            default: () => 'horizontal',
            type: String,
        },
        stream: {
            required: true,
            type: Object,
        },
        /**
         * Stream id is passed to be able to react to stream changes.
         */
        streamId: {
            required: true,
            type: String,
        },
    },
    unmounted: function() {
        // Stop the volume meter.
        window.cancelAnimationFrame(this.rafID)
    },
    watch: {
        streamId() {
            this.updateSoundmeter()
        },
    },
}
</script>

<style lang="scss">
canvas {
    border: 1px solid var(--grey-5);
    height: var(--spacer);
    margin: var(--spacer);
    width: 100%;

    &.vertical {
        transform: scale(-1, -1);
    }
}
</style>
