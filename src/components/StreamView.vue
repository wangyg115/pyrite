<template>
    <Login v-if="!state.connected" class="content" />
    <div
        v-else
        class="video-container"
        :class="gridClass"
    >
        <Stream v-for="peer of state.streams" :key="peer.id" :peer="peer" />
    </div>
</template>

<script>
import Login from './Login.vue'
import Stream from './Stream.vue'

export default {
    components: {Login, Stream},
    data() {
        return {
            state: app.state
        }
    },
    computed: {
        gridClass() {
            const classes={}
            classes[`grid-${this.state.streams.length}`] = true
            return classes
        }
    },
    watch: {
        'state.streams'() {
            console.log('PEERS CHANGED',this.state.streams)
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
        background: #0ff;
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