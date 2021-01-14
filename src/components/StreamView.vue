<template>
    <Login v-if="!state.connected" class="content" />

    <div
        v-else
        class="c-stream-view"
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
.c-stream-view {
    background: var(--grey-400);
    display: grid;


    padding: var(--spacer);

    & .c-stream {
         background: var(--grey-500);


        & video {
            flex: 1;
        }
    }

    &.grid-1 {
        grid-template-rows: 50% 50%;
        grid-template-columns: 50% 50%;
        grid-gap: 1rem;
        /* grid-template-columns: repeat(4, 0.5fr); */
    }

    &.grid-2 {
        grid-template-rows: 50% 50%;
        grid-template-columns: 50% 50%;
        /* grid-gap: 1rem; */
        /* grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); */
    }
}

</style>