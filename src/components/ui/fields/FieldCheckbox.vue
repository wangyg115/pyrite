<template>
    <div class="c-field-checkbox field">
        <div class="row">
            <label class="switch" :class="elementclass" :for="name">
                <input
                    :id="name"
                    :checked="value"
                    :class="elementclass"
                    :disabled="disabled"
                    :name="name"
                    type="checkbox"
                    @change="updateModel($event)"
                >
                <span class="slider" />
            </label>
            <div class="field-label">
                {{ label }}
            </div>
        </div>
        <div v-if="help && !invalidFieldValue" class="help">
            {{ help }}
        </div>
    </div>
</template>
<script>
import Field from './field'
export default {
    extends: Field,
    props: {
        modelValue: {
            required: true,
            type: String
        }
    },
    emits: ['update:modelValue'],
    methods: {
        updateModel: function(event) {
            this.$emit('update:modelValue', event.target.checked)
        },
    },
}
</script>
<style lang="postcss">
.c-field-checkbox {
    & .row {
        align-items: center;
        display: flex;
    }

    & label.switch {
        height: calc(var(--spacer) * 3);
        margin-right: var(--spacer);
        position: relative;
        user-select: none;
        width: calc(var(--spacer) * 5);

        & input {
            height: 0;
            opacity: 0;
            width: 0;

            & + .slider {
                svg {
                    transition: all 0.5s ease-in-out;
                }
            }

            &:checked + .slider {
                background: var(--primary-color);

                &::before {
                    transform: translateX(calc(var(--spacer) * 2));
                }
            }
        }

        & .slider {
            background-color: var(--grey-500);
            border-radius: 10px;
            bottom: 0;
            cursor: pointer;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;

            &::before {
                background: var(--grey-200);
                border-radius: 50%;
                bottom: calc(var(--spacer) / 2);
                content: '';
                height: calc(var(--spacer) * 2);
                left: calc(var(--spacer) / 2);
                position: absolute;
                transition: 0.4s;
                width: calc(var(--spacer) * 2);
            }
        }
    }

    & .icon-enabled,
    & .icon-disabled {
        @include icon-size(var(--icon-normal));
        fill: var(--grey-50);
        height: 100%;
        position: absolute;
    }

    & .icon-disabled {
        left: 3px;
    }

    & .icon-enabled {
        right: 3px;
    }
}

</style>