<template>
    <div class="c-button-group" :class="{active}">
        <slot />
    </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    props: {
        active: {
            type: Boolean,
            required: true,
        },
    },
})
</script>

<style lang="scss">
.c-button-group {
    // background: var(--grey-3);
    transition: background 0.3s ease;

    &:hover,
    &.active {
        background: var(--grey-3);
    }

    .btn {

        .active-group {
            opacity: 0.5;
        }
    }
}
</style>
