<template>
    <icon
        v-if="modelValue.locked" class="icon icon-mini locked"
        name="lock"
        @click="onClick(false)"
    />
    <input
        :class="{ locked: modelValue.locked }"
        :disabled="modelValue.locked"
        orient="vertical"
        step="1"
        type="range"
        :value="modelValue.value"
        @click="onClick(true)"
        @input="updateModel($event)"
    >
</template>

<script>
export default {
    props: {
        modelValue: {
            type: Object,
            required: true
        }
    },
    emits: ['update:modelValue'],
    methods: {
        onClick(doubleClick) {
            // Locked feature is disabled:
            console.log('moDELVAL', this.modelValue)
            if (this.modelValue.locked === null) return

            if (doubleClick) {
                // Simulate double-click in order to toggle locking a channel.
                if(!this.timeoutId) {
                    this.timeoutId = setTimeout(() => { this.timeoutId = null }, 500)
                } else {
                    clearTimeout(this.timeoutId)
                    this.timeoutId = null
                    this.$emit('update:modelValue', {
                        locked: !this.modelValue.locked,
                        value:  this.modelValue.value
                    })
                }
            } else {
                this.$emit('update:modelValue', {
                    locked: !this.modelValue.locked,
                    value:  this.modelValue.value
                })
            }
        },
        updateModel(event) {
            if (this.modelValue.locked) return
            this.$emit('update:modelValue', {
                locked: this.modelValue.locked,
                value: parseInt(event.target.value, 10)
            })
        },
    },
}
</script>

<style lang="postcss">
.icon.locked {
    color: var(--warning-color);
    margin-left: calc(3 * var(--spacer));
    position: absolute;
    z-index: 1000;
}

input[type="range"] {
    appearance: none;
    background: var(--grey-500);
    border: 1px solid var(--grey-300);
    overflow: hidden;
    transform: rotate(-90deg);
    width: var(--space-4);

    &::-webkit-slider-runnable-track {
        appearance: none;
        height: var(--spacer);
        margin-top: -1px;
    }

    &::-webkit-slider-thumb {
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

    &:focus {
        outline: none;
    }

    &.locked {

        &::-webkit-slider-thumb {
            box-shadow: -80px 0 0 80px var(--warning-color);

            &:hover {
                cursor: disabled !important;
            }
        }
    }
}
</style>
