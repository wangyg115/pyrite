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
    }
}
</script>