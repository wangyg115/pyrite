<template>
    <input
        orient="vertical" step="1"
        type="range"
        :value="modelValue"
        @change="updateModel($event)"
    >
</template>
<script>
export default {
    props: {
        modelValue: {
            type: Number,
            required: true
        }
    },
    emits: ['update:modelValue'],
    methods: {
        updateModel: function(event) {
            this.$emit('update:modelValue', parseInt(event.target.value, 10))
        },
    },
}
</script>
<style lang="postcss">
input[type="range"] {
    appearance: none;
    background-color: var(--grey-300);
    border: 1px solid var(--grey-400);
    overflow: hidden;
    transform: rotate(-90deg);
    width: var(--space-4);
}

input[type=range]:focus {
    outline: none;
}

input[type="range"]::-webkit-slider-runnable-track {
    appearance: none;
    height: var(--spacer);
    margin-top: -1px;

    &:hover {
        cursor: s-resize;
    }
}

input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    background: var(--grey-500);
    box-shadow: -80px 0 0 80px var(--primary-color);
    cursor: ew-resize;
    height: var(--spacer);
    width: var(--space-1);

    &:hover {
        cursor: s-resize;
    }
}
</style>
