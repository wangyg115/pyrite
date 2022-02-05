<template>
    <section v-if="stats && Object.keys(stats.clients).length" class="c-admin-groups-stats tab-content active">
        <div v-for="client of stats.clients" :key="client.id" class="client">
            <div class="client-header" :class="{collapsed: client.collapsed}" @click="toggleCollapse(client)">
                <Icon class="icon icon-small" name="Stats" /> {{ client.id }}
            </div>
            <template v-if="!client.collapsed">
                <div v-for="stream of client.up" :key="stream.id" class="stream">
                    <!-- eslint-disable-next-line vue/valid-v-for -->
                    <div v-for="track of stream.tracks" :key="`${client.id}-${stream.id}`" class="track">
                        <template v-for="(data, name) in track" :key="name">
                            <Chart v-if="statProps[name]" :data="data" :name="name" />
                        </template>
                    </div>
                </div>
            </template>
        </div>
    </section>
    <section v-else class="c-admin-dashboard tab-content no-results">
        <Icon class="icon icon-large" name="Stats" />
        <span>{{ $t('no connections') }}</span>
    </section>
</template>

<script>
import Chart from '@/vue/Elements/Chart.vue'
import {defineComponent} from 'vue'

export default defineComponent({
    components: {Chart},
    data() {
        return {
            statProps: {
                bitrate: false,
                jitter: false,
                loss: false,
                maxBitrate: false,
            },
            stats: {
                clients: {},
            },
        }
    },
    methods: {
        async loadStats() {
            let initClient = false
            const stats = await this.app.api.get(`/api/dashboard/${this.groupId}`)
            if (!stats.clients) {
                this.stats.clients = {}
                return
            }

            const clients = stats.clients.map((i) => i.id)

            if (!this.stats) {
                initClient = true
                this.stats = stats
            }

            const removedClients = Object.keys(this.stats.clients).filter((i) => !clients.includes(i))
            // A client was removed.
            for (const clientId of removedClients) {
                this.app.logger.info(`remove client ${clientId}`)
                delete this.stats.clients[clientId]
            }

            if (!Array.isArray(stats.clients)) {
                return
            }

            for (const client of stats.clients) {
                if (!client.up) continue

                if (!this.stats.clients[client.id]) {
                    this.stats.clients[client.id] = client
                    this.stats.clients[client.id].collapsed = true
                    initClient = true
                }

                if (!this.stats.clients[client.id].up || !this.stats.clients[client.id].up.length === client.up.length) {
                    this.stats.clients[client.id].up = JSON.parse(JSON.stringify(client.up))
                    initClient = true
                }

                for (const [streamIndex, stream] of client.up.entries()) {
                    if (stream.tracks.length !== this.stats.clients[client.id].up[streamIndex].tracks.length) {
                        this.stats.clients[client.id].up[streamIndex].tracks = JSON.parse(JSON.stringify(stream.tracks))
                        initClient = true
                    }

                    for (let [trackIndex, track] of stream.tracks.entries()) {
                        let trackRef = this.stats.clients[client.id].up[streamIndex].tracks
                        if (initClient) {
                            trackRef[trackIndex] = {
                                bitrate: [track.bitrate],
                                jitter: [track.jitter],
                                loss: [track.loss],
                                maxBitrate: [track.maxBitrate],
                            }

                        } else {
                            if (this.statEnabled(trackRef[trackIndex], 'bitrate')) this.statProps.bitrate = true
                            trackRef[trackIndex].bitrate.push(track.bitrate)

                            if (this.statEnabled(trackRef[trackIndex], 'jitter')) this.statProps.jitter = true
                            trackRef[trackIndex].jitter.push(track.jitter)

                            if (this.statEnabled(trackRef[trackIndex], 'loss')) this.statProps.loss = true
                            trackRef[trackIndex].loss.push(track.loss)

                            if (this.statEnabled(trackRef[trackIndex], 'maxBitrate')) this.statProps.maxBitrate = true
                            trackRef[trackIndex].maxBitrate.push(track.maxBitrate)
                        }

                    }
                }
            }
        },
        statEnabled(track, property) {
            // Already enabled; return quick.
            if (this.statProps[property]) return true
            if (track[property].find((i) => i !== track[property][0])) return true
            return false
        },
        statsPoller() {
            this.intervalId = setInterval(this.loadStats, 250)
        },
        toggleCollapse(client) {
            client.collapsed = !client.collapsed
        },
    },
    mounted() {
        this.loadStats(this.groupId)
        this.statsPoller()
    },
    unmounted() {
        clearInterval(this.intervalId)
    },
    props: {
        groupId: {
            default: () => null,
            required: false,
            type: String,
        },
    },

    watch: {
        groupId(newValue) {
            this.loadStats(newValue)
        },
    },
})
</script>

<style lang="scss">
.c-admin-groups-stats {

    .client {
        background: var(--grey-1);
        margin-bottom: var(--spacer);
        padding: var(--spacer);

        .client-header {
            align-items: center;
            color: var(--primary-color);
            display: flex;
            font-family: var(--font-secondary);
            font-size: var(--text-s);
            user-select: none;

            &.collapsed {
                color: var(--grey-7);
            }

            svg {
                margin-right: var(--spacer);
            }

            &:hover {
                cursor: pointer;
            }
        }

        .stream {
            padding: var(--space-05);

            .track {
                background: var(--grey-2);
                margin-bottom: var(--space-1);
                padding: var(--spacer);
            }
        }
    }
}
</style>
