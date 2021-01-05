<template>
    <div id="video-container" class="video-container" :class="gridClass">
        <Peer v-for="peer of state.peers" :key="peer.id" :peer="peer" />
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
    computed: {
        gridClass() {
            const classes={}
            classes[`grid-${this.state.peers.length}`] = true
            return classes
        }
    },
    watch: {
        'state.peers'() {
            console.log('PEERS CHANGED',this.state.peers)
        }
    }
}
</script>
<style lang="postcss">
.video-container {
    background: var(--grey-500);
    display: flex;
    flex: 1;
    flex-direction: column;

    & .peer {
        background: #0FF;
        display: flex;
        /* max-height: 50px; */
        position: relative;

        & video {
            flex: 1;
        }
    }

    /* &.grid-1 {
        grid-template-columns: repeat(1fr);
    }

    &.grid-2 {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    } */
}

</style>