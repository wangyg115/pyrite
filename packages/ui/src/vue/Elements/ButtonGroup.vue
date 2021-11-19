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
    transition: background 0.3s ease;

    &.active {
        background: var(--grey-5);
    }

    .btn {
        .active-group {
            opacity: 0.5;
            // color: var(--primary-color);
        }
    }
}
</style>
