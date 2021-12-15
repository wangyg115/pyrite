<template>
    <div class="c-stream-reports">
        <div v-if="Object.keys(description.settings.video).length" class="category">
            <div class="title">
                Video
            </div>
            <div v-for="(stat, statName) of description.settings.video" :key="statName" class="stat">
                <div class="key">
                    {{ statName }}
                </div>
                <div class="value">
                    {{ stat }}
                </div>
            </div>
        </div>

        <div v-if="description.settings.audio && Object.keys(description.settings.audio).length" class="category">
            <div class="title">
                Audio
            </div>
            <div v-for="(stat, statName) of description.settings.audio" :key="statName" class="stat">
                <div class="key">
                    {{ statName }}
                </div>
                <div class="value">
                    {{ stat }}
                </div>
            </div>
        </div>

        <div
            v-for="(category, categoryName) of stats" :key="categoryName"
            class="category"
        >
            <div class="title">
                {{ categoryName }}
            </div>
            <div v-for="(stat, statName) of category" :key="statName" class="stat">
                <div class="key">
                    {{ statName }}
                </div>
                <div class="value">
                    {{ stat }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            active: null,
            glnStream: null,
            stats: {},
        }
    },
    methods: {
        onDownStats() {
            this.glnStream.pc.getReceivers().forEach(r => {
                let tid = r.track && r.track.id

                const stats = tid && this.glnStream.stats[tid]
                if (stats) {
                    const filtered = {}
                    for (const [categoryName, category] of Object.entries(stats)) {
                        filtered[categoryName] = {}
                        if (categoryName === 'track') {
                            for (const [statName, stat] of Object.entries(category)) {
                                if (statName === 'timestamp') {
                                    continue
                                } else if (statName === 'totalAudioEnergy') {
                                    filtered[categoryName]['Total Audio Energy'] = Number(stat).toFixed(2)
                                } else if (statName === 'audioEnergy') {
                                    filtered[categoryName]['Audio Energy'] = Number(stat).toFixed(2)
                                }
                            }
                        }
                    }
                    this.stats = filtered

                }
            })
        },
        onUpStats() {
            this.glnStream.pc.getSenders().forEach(s => {
                let tid = s.track && s.track.id
                const stats = this.glnStream.stats[tid]

                if (stats) {
                    const filtered = {}
                    for (const [categoryName, category] of Object.entries(stats)) {
                        filtered[categoryName] = {}
                        if (categoryName === 'outbound-rtp') {
                            for (const [statName, stat] of Object.entries(category)) {
                                if (statName === 'timestamp') {
                                    continue
                                } else if (statName === 'rate') {
                                    filtered[categoryName]['Data Rate'] = `${Math.round(stat / 1000)} Kbps`
                                } else if (statName === 'bytesSent') {
                                    filtered[categoryName]['Streamed'] = `${Math.round(stat / 1000 / 1024)} Mb`
                                }
                            }
                        }
                    }

                    this.stats = filtered
                }
            })
        },
    },
    mounted() {
        this.glnStream = null
        if (app.connection.up[this.description.id]) {
            this.glnStream = app.connection.up[this.description.id]
            this.glnStream.onstats = this.onUpStats
        } else {
            this.glnStream = app.connection.down[this.description.id]
            this.glnStream.onstats = this.onDownStats
        }

        this.glnStream.setStatsInterval(250)
    },
    props: {
        description: {
            default: () => {},
            type: Object,
        },
    },
    unmounted() {
        this.glnStream.onstats = null
    },
}
</script>

<style lang="scss">
.c-stream-reports {
    background: rgb(0 0 0 / 75%);
    color: #fff;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: absolute;
    width: 100%;

    &:hover {
        cursor: pointer;
    }

    .title {
        color: var(--primary-color);
        font-weight: 600;
    }

    .category {
        display: flex;
        flex-direction: column;
        font-size: var(--text-tiny);
        gap: var(--spacer);
        margin-top: var(--spacer);
        overflow-y: scroll;
        padding: var(--spacer);

        .stat {
            display: flex;

            .key {
                font-weight: bold;
            }

            .value {
                left: 200px;
                position: absolute;
            }
        }

        &.active {
            display: flex;
        }
    }
}
</style>
