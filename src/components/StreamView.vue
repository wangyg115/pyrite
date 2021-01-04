<template>
    <div id="video-container" class="video-container">
        <div id="expand-video" class="expand-video">
            <div id="peers">
                <Peer v-for="peer of state.peers" :key="peer.id" :peer="peer" />
            </div>
        </div>
    </div>
</template>

<script>
import Peer from './Peer.vue'

export default {
    components: {Peer},
    data() {
        return {
            state: app.state
        }
    },
    watch: {
        'state.peers'() {
            console.log('PEERS CHANGED',this.state.peers)
        }
    },
    methods: {
        resizePeers() {
            // Window resize can call this method too early
            if (!this.connection)
                return
            let count =
                Object.keys(this.connection.up).length +
                Object.keys(this.connection.down).length
            let peers = document.getElementById('peers')
            let columns = Math.ceil(Math.sqrt(count))
            if (!count)
                // No video, nothing to resize.
                return
            let container = document.getElementById("video-container")
            // Peers div has total padding of 40px, we remove 40 on offsetHeight
            // Grid has row-gap of 5px
            let rows = Math.ceil(count / columns)
            let margins = (rows - 1) * 5 + 40

            if (count <= 2 && container.offsetHeight > container.offsetWidth) {
                peers.style['grid-template-columns'] = "repeat(1, 1fr)"
                rows = count
            } else {
                peers.style['grid-template-columns'] = `repeat(${columns}, 1fr)`
            }
            if (count === 1)
                return
            let max_video_height = (peers.offsetHeight - margins) / rows
            let media_list = peers.querySelectorAll(".media")
            for(let i = 0; i < media_list.length; i++) {
                let media = media_list[i]
                if(!(media instanceof HTMLMediaElement)) {
                    console.warn('Unexpected media')
                    continue
                }
                media.style['max-height'] = max_video_height + "px"
            }
        }
    }
}
</script>