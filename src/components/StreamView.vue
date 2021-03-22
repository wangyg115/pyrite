<template>
    <Login v-if="!state.connected" class="content" />
    <div v-else-if="state.streams.length" class="c-stream-view" :class="gridClass">
        <Stream v-for="(description, index) in state.streams" :key="description.id" v-model="state.streams[index]" />
    </div>
    <div v-else class="stream-placeholder">
        <Icon class="icon" name="Groups" />
    </div>
</template>

<script>
import Login from './Login.vue'
import Stream from './Stream.vue'

export default {
    components: {Login, Stream},
    computed: {
        gridClass() {
            const classes={}
            const streams = this.state.streams.length

            if (streams <= 4) {
                classes[`${this.gridMode}-4`] = true
            } else if (streams >= 5 && streams <= 9) {
                classes[`${this.gridMode}-9`] = true
            } else if (streams >= 10 && streams <= 20) {
                classes[`${this.gridMode}-20`] = true
            } else if (streams > 20) {
                classes[`${this.gridMode}-x`] = true
            }

            return classes
        },
    },
    data() {
        return {
            gridMode: 'gallery',
            state: app.state,
        }
    },
}
</script>
<style lang="postcss">
/**
 * 'gallery'-type grid-system:
 * 1-4: 2 rows, 2 columns
 * 5-9: 3 rows, 3 columns
 * 10-20: 5 rows, 4 columns
 * > 20: 5 rows, 4 columns + scroll
*/

.c-stream-view {
    align-items: center;
    background: var(--grey-500);
    display: grid;

    & .c-stream {
        background: var(--grey-500);

        & video {
            flex: 1;
        }
    }

    &.gallery-4 {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
    }

    &.gallery-9 {
        grid-template-columns: 33.33% 33.33% ;
        grid-template-rows: 33.33% 33.33%;
    }
}

.stream-placeholder {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    width: 100%;

    & svg {
        height: 30%;
        width: 30%;
    }

}

</style>
