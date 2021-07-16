<template>
    <div ref="view" class="c-stream-view">
        <Stream
            v-for="(description, index) in $s.streams" :key="description.id"
            :ref="el => { if (el) { streamsRef[index] = el } else {streamsRef.splice(index, 1)}}"
            v-model="$s.streams[index]"
        />
        <Icon v-if="!$s.streams.length" class="icon logo-animated" name="Logo" />
    </div>
</template>

<script>
import {nextTick} from 'vue'
import Stream from './Stream.vue'

/**
 * Grid-layout made possible by https://github.com/salbatore
 * See: https://alicunde.github.io/Videoconference-Dish-CSS-JS/
 */
export default {
    components: {Stream},
    beforeUnmount() {
        this.resizeObserver.disconnect()
    },
    beforeUpdate() {
        this.itemRefs = []
    },
    async mounted() {
        this.resizeObserver = new ResizeObserver(async() => {
            requestAnimationFrame(this.setView.bind(this))
        })

        this.setView()
        this.resizeObserver.observe(this.$refs.view)
    },
    methods: {
        area(increment, streamCount, width, height, margin = 8) {
            let i = 0
            let w = 0

            let h = increment * 0.75 + (margin * 2)
            while (i < (streamCount)) {
                if ((w + increment) > width) {
                    w = 0
                    h = h + (increment * 0.75) + (margin * 2)
                }
                w = w + increment + (margin * 2)
                i++
            }
            if (h > height) return false
            else return increment
        },
        setView() {
            const margin = 8
            if (!this.$refs.view) return

            const width = this.$refs.view.offsetWidth - (margin * 2)
            const height = this.$refs.view.offsetHeight - (margin * 2)

            let max = 0

            let i = 1
            while (i < 5000) {
                let w = this.area(i, this.streamsRef.length, width, height, margin)
                if (w === false) {
                    max =  i - 1
                    break
                }
                i++
            }

            if (max > width) {
                max = width
            } else {
                max = max - (margin * 2)
            }
            this.setWidth(max, margin)
        },
        setWidth(width, margin) {
            for (const streamRef of this.streamsRef) {
                let aspectRatio
                if (streamRef.modelValue.settings.video) {
                    aspectRatio = 1 / streamRef.modelValue.settings.video.aspectRatio
                } else if (streamRef.$refs.media.videoHeight) {
                    aspectRatio = streamRef.$refs.media.videoHeight / streamRef.$refs.media.videoWidth
                } else {
                    aspectRatio = 0.75
                }

                streamRef.$refs.root.style.width = width + 'px'
                streamRef.$refs.root.style.margin = margin + 'px'
                streamRef.$refs.root.style.height = (width * aspectRatio) + 'px'
            }
        },
    },
    data() {
        return {
            streamsRef: [],
        }
    },
    watch: {
        '$s.streams': {
            deep: true,
            async handler() {
                await nextTick()
                this.setView()
            },
        },
    },
}
</script>

<style lang='scss'>

@keyframes show {

    0%{
        opacity: 0;
        transform: scale(0) translateY(20px);
    }

    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.c-stream-view {
    align-content: center;
    align-items: center;
    background: var(--grey-600);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    overflow: hidden;

    .c-stream {
        align-self: center;
        animation: show 0.25s ease-in-out;
        box-shadow: 0px var(--spacer) var(--spacer) rgba(0, 0, 0, 0.4);
        position: relative;
    }

    .logo-animated {
        height: 30%;
        width: 30%;
    }
}
</style>
