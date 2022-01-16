<template>
    <div class="c-chart">
        <svg class="chart" :viewBox="`0 0 ${view.width + padding.x} ${view.height + padding.y}`">
            <rect
                class="chart-area" :height="view.height"
                :width="view.width"
                :x="padding.x"
            />
            <text
                class="name"
                text-anchor="end"
                :x="view.width + padding.x - 2"
                :y="view.height + padding.y - 2"
            >{{ name }}</text>
            <text
                v-for="axisStep in axisSteps"
                :key="axisStep.position"
                class="axis-y" :style="`font-size: ${axis.fontSize};`"
                text-anchor="end"
                :x="padding.x - 4"
                :y="axisStep.position"
            >{{ axisStep.label }}</text>
            <polyline
                class="line"
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
            const yStep = (this.view.height / this.axis.y.steps) + this.axis.fontSize / 4
            let yValueStep = ((this.yRange.high - this.yRange.low) / this.axis.y.steps)

            let yValueSteps = [this.axisValue(this.yRange.low)]
            for (let i = 1; i <= this.axis.y.steps - 2; i++) {
                yValueSteps.push(this.axisValue(yValueStep * i))
            }
            yValueSteps.push(this.axisValue(this.yRange.high))
            // Actual values are mirrored.
            yValueSteps = yValueSteps.reverse()
            const axisSteps = []
            const axisBase = (this.padding.y - this.axis.fontSize / 2)
            for (let i = 0; i <= this.axis.y.steps - 1; i++) {
                axisSteps.push({label: yValueSteps[i], position: axisBase + ((yStep * i))})
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
                pointString += `${(xStep * index + this.padding.x)},${y} `
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
            axis: {
                fontSize: 6,
                y: {
                    steps: 5,
                },
            },
            padding: {
                x: 30,
                y: 12,
            },
            view: {
                height: 75,
                width: 500,
            },
        }
    },
    methods: {
        axisValue(value) {
            if(value < 10) {
                return value.decimals(2)
            } else {
                return Math.ceil(value)
            }
        },
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

        .line {
            stroke: var(--primary-color);
        }

        .chart-area {
            stroke: var(--grey-4);
        }

        .axis-y {
            fill: var(--grey-7);
            font-family: var(--font-secondary);
            stroke: none;
        }

        .name {
            fill: var(--grey-6);
            font-family: var(--font-secondary);
            font-size: var(--text-xs);
            stroke: none;
        }
    }
}
</style>
