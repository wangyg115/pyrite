<template>
    <div v-if="stats && Object.keys(stats.clients).length" class="c-admin-groups-dashboard content">
        <header>
            <div class="notice" />
            <div class="title">
                <span>{{ $t('Dashboard') }}</span>
                <Icon class="icon icon-regular" name="Dashboard" />
            </div>
        </header>

        <section>
            <div v-for="client of stats.clients" :key="client.id" class="client">
                <div class="client-id">
                    {{ client.id }}
                </div>
                <template v-if="client">
                    <div v-for="stream of client.up" :key="stream.id" class="stream">
                        <!-- eslint-disable-next-line vue/valid-v-for -->
                        <div v-for="track of stream.tracks" :key="`${client.id}-${stream.id}`">
                            <div v-for="(data, name) in track" :key="name">
                                <Chart v-if="statProps[name]" :data="data" :name="name" />
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </section>
    </div>
    <Splash v-else :header="groupId" :instruction="$t('No client connected yet')" />
</template>

<script>
import Chart from '@/vue/Elements/Chart.vue'
import {defineComponent} from 'vue'
import Splash from '@/vue/Elements/Splash.vue'

export default defineComponent({
    components: {Chart, Splash},
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
            const stats = await app.api.get(`/api/dashboard/${this.groupId}`)
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
                app.logger.info(`remove client ${clientId}`)
                delete this.stats.clients[clientId]
            }

            if (!Array.isArray(stats.clients)) {
                return
            }

            for (const client of stats.clients) {
                if (!client.up) continue

                if (!this.stats.clients[client.id]) {
                    this.stats.clients[client.id] = client
                    initClient = true
                }

                if (!this.stats.clients[client.id]) {
                    this.stats.clients[client.id] = JSON.parse(JSON.stringify(client))
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
.c-admin-groups-dashboard {

    .client {
        background: var(--grey-1);
        padding: var(--spacer);

        .client-id {
            font-family: var(--font-secondary);
            font-size: var(--text-small);
            padding: var(--spacer) 0;
            padding-top: 0;
        }

        .stream {
            background: var(--grey-2);
            padding: var(--spacer);
        }
    }
}
</style>
