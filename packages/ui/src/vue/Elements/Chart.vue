<template>
    <div class="c-chart">
        <svg class="chart" :viewBox="`0 0 ${view.width + padding} ${view.height + padding}`">
            <text
                class="name" writing-mode="rl"
                :x="view.width - padding"
                :y="view.height + padding - 2"
            >{{ name }}</text>
            <text
                v-for="axisStep in axisSteps"
                :key="axisStep.position" class="axis-y"
                x="0"
                :y="axisStep.position"
            >{{ axisStep.label }}</text>
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
        axisSteps() {
            const yStep = this.view.height / 5
            this.yRange.high
            const yValueStep = Math.ceil((this.yRange.high - this.yRange.low) / 5)
            let yValueSteps = []
            for (let i = 1; i <= 5; i++) {
                yValueSteps.push(yValueStep * i)
            }
            // Actual values are mirrored.
            yValueSteps = yValueSteps.reverse()
            const axisSteps = []
            for (let i = 0; i <= 4; i++) {
                axisSteps.push({label: yValueSteps[i], position: (yStep * i + this.padding)})
            }

            return axisSteps
        },
        points() {
            let pointString = ''
            let xStep = this.view.width / this.data.length

            for (const [index, point] of this.data.entries()) {
                let y
                if (this.yRange.range > 0) {
                    y = (((point -  this.yRange.low) / this.yRange.range) * this.view.height)
                } else {
                    y = 0
                }
                pointString += `${(xStep * index + this.padding)},${y} `
            }
            return pointString
        },
        yRange() {
            let yHigh, yLow
            for (const point of this.data) {
                if (!yLow || point < yLow) yLow = point
                if (!yHigh || point > yHigh) yHigh = point
            }

            return {high: yHigh, low: yLow, range: yHigh - yLow}
        },

    },
    data() {
        return {
            padding: 10,
            view: {
                height: 50,
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

        .axis-y {
            fill: var(--grey-7);
            font-family: var(--font-secondary);
            font-size: 6px;
            stroke: none;
        }

        .name {
            fill: var(--grey-6);
            font-family: var(--font-secondary);
            font-size: var(--text-tiny);
            stroke: none;
        }
    }
}
</style>
