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

export default {
    components: {Stream},
    beforeUpdate() {
        this.itemRefs = []
    },
    async mounted() {
        this.resizeObserver = new ResizeObserver(() => {
            this.setView()
        })

        await nextTick()
        // window.onresize = this.setView.bind(this)
        this.setView()
        this.resizeObserver.observe(this.$refs.view)
    },
    methods: {
        /**
         * Thanks to https://alicunde.github.io/Videoconference-Dish-CSS-JS/
         */
        area(increment, streamCount, width, height, margin = 8) {
            let i = 0
            let w = 0
            // * 5000
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

            // loop (i recommend you optimize this)
            let i = 1
            while (i < 5000) {
                let w = this.area(i, this.streamsRef.length, width, height, margin)
                if (w === false) {
                    max =  i - 1
                    break
                }
                i++
            }
            // set styles
            max = max - (margin * 2)
            this.setWidth(max, margin)
        },
        setWidth(width, margin) {
            for (const streamRef of this.streamsRef) {
                if (!streamRef.$refs.root) continue
                streamRef.$refs.root.style.width = width + 'px'
                streamRef.$refs.root.style.margin = margin + 'px'
                streamRef.$refs.root.style.height = (width * 0.75) + 'px'
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

<style lang='postcss'>

@keyframes show {

    0%{
        opacity: 0;
        transform: scale(0.4) translateY(20px);
    }

    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.c-stream-view {
    align-content: center;
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    height: 100vh;
    justify-content: center;
    vertical-align: middle;

    & > div {
        align-self: center;
        animation: show 0.25s ease-in-out;
        box-shadow: 0px 12px 22px rgba(0, 0, 0, 0.4);
        position: relative;
        vertical-align: middle;
    }

    & .logo-animated {
        height: 30%;
        width: 30%;
    }
}
</style>
