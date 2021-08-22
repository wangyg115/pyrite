<template>
    <div class="c-field-slider">
        <Icon
            v-if="modelValue.locked" class="icon icon-tiny locked"
            name="Lock"
            @click="onClick(false)"
        />
        <input
            :class="{ locked: modelValue.locked }"
            :disabled="modelValue.locked"
            step="1"
            type="range"
            :value="modelValue.value"
            @click="onClick(true)"
            @input="updateModel($event)"
        >
        <div class="event-catcher" @click="onClick(true)" />
    </div>
</template>

<script>
export default {
    emits: ['update:modelValue'],
    methods: {
        onClick(doubleClick) {
            // Locked feature is disabled:
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
                        value:  this.modelValue.value,
                    })
                }
            } else {
                this.$emit('update:modelValue', {
                    locked: !this.modelValue.locked,
                    value:  this.modelValue.value,
                })
            }
        },
        updateModel(event) {
            if (this.modelValue.locked) return
            this.$emit('update:modelValue', {
                locked: this.modelValue.locked,
                value: parseInt(event.target.value, 10),
            })
        },
    },
    props: {
        modelValue: {
            required: true,
            type: Object,
        },
    },
}
</script>

<style lang="scss">
.c-field-slider {

    .icon.locked {
        color: var(--warning-color);
        margin-left: -3px;
        margin-top: calc(-2 * var(--spacer));
        position: absolute;
        z-index: 1000;

        &:hover {
            cursor: pointer;
        }
    }

    input[type="range"] {
        appearance: none;
        background: var(--grey-600);
        border: 1px solid var(--grey-200);
        height: 100%;
        margin: 0;
        overflow: hidden;
        transform: rotate(-90deg);
        width: 100%;

        &::-moz-range-track {
            overflow: hidden;
            width: 2px !important;

            &:hover {
                cursor: ew-resize;
            }
        }

        &::-moz-range-thumb {
            background: var(--primary-color);
            border: 0;
            border-radius: 0;
            box-shadow: -80px 0 0 80px var(--primary-color);
            display: none;
            height: 100%;
            width: var(--space-1);
        }

        &::-webkit-slider-runnable-track {
            appearance: none;
            height: var(--spacer);
            margin-top: -1px;
        }

        &::-webkit-slider-thumb {
            appearance: none;
            background: var(--primary-color);
            box-shadow: -80px 0 0 80px var(--grey-200);
            height: var(--spacer);
            width: var(--space-1);
        }

        &:hover {
            cursor: ns-resize;
        }

        &[disabled]:hover {
            cursor: not-allowed;
        }

        &:focus {
            outline: none;
        }

        &.locked {

            &::-webkit-slider-thumb {
                background: var(--warning-color);
                // box-shadow: -80px 0 0 80px var(--warning-color);

                &:hover {
                    cursor: disabled !important;
                }
            }
        }
    }
}
</style>
