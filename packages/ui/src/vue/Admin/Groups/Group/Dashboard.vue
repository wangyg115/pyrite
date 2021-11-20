<template>
    <div class="c-admin-groups-dashboard content">
        <header>
            <div class="notice" />
            <div class="title">
                <span>{{ $t('Dashboard') }}</span>
                <Icon class="icon icon-regular" name="Dashboard" />
            </div>
        </header>

        <section v-if="stats && stats.clients">
            <div v-for="client of stats.clients" :key="client.id">
                ID: {{ client.id }}
                <template v-if="client">
                    <div v-for="stream of client.up" :key="stream.id" class="stream">
                        <!-- eslint-disable-next-line vue/valid-v-for -->
                        <div v-for="track of stream.tracks" :key="`${client.id}-${stream.id}`">
                            <div v-for="(data, name) in track">
                                <Chart v-if="statProps[name]" :data="data" :name="name" />
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </section>
    </div>
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
                    console.log("INIT 1")
                    this.stats.clients[client.id] = client
                    initClient = true
                }

                if (!this.stats.clients[client.id]) {
                    console.log("INIT 2")
                    this.stats.clients[client.id] = JSON.parse(JSON.stringify(client))
                    initClient = true
                }

                if (!this.stats.clients[client.id].up || !this.stats.clients[client.id].up.length === client.up.length) {
                    console.log("INIT 3", client.up)
                    this.stats.clients[client.id].up = JSON.parse(JSON.stringify(client.up))
                    initClient = true
                }

                for (const [streamIndex, stream] of client.up.entries()) {
                    if (stream.tracks.length !== this.stats.clients[client.id].up[streamIndex].tracks.length) {
                        console.log("INIT 4")
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

</style>
