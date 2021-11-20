<template>
    <div class="c-chart">
        <svg class="chart" :viewBox="`0 0 ${view.width} ${view.height}`">
            <text class="name" x="2" :y="view.height - 2">{{ name }}</text>
            <polyline
                fill="none"
                :points="points"
                stroke-width="1"
            />
        </svg>
    </div>
</template>

<script>
export default {
    computed: {
        points() {
            let pointString = ''

            let yLow
            let yHigh
            for (const point of this.data) {
                if (!yLow || point < yLow) yLow = point
                if (!yHigh || point > yHigh) yHigh = point
            }

            const yRange = yHigh - yLow
            let xStep = this.view.width / this.data.length

            for (const [index, point] of this.data.entries()) {
                let y
                if (yRange > 0) y = ((point - yLow) / yRange) * this.view.height
                else y = 0
                pointString += `${xStep * index},${y} `
            }
            return pointString
        },
    },
    data() {
        return {
            view: {
                height: 25,
                width: 500,
            },
        }
    },
    props: {
        data: {
            required: true,
            type: Array,
        },
        name: {
            required: true,
            type: String,
        },

    },
}
</script>

<style lang="scss">
.c-chart {

    svg {
        background: var(--grey-1);
        stroke: var(--primary-color);

        .name {
            fill: var(--grey-9);
            font-family: var(--font-secondary);
            font-size: var(--text-tiny);
            stroke: none;
        }
    }
}
</style>
