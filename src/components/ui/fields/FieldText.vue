<template>
    <div class="c-field-text field">
        <label v-if="label" :for="name">{{ label }}</label>
        <div class="input-container">
            <input
                :autocomplete="autocomplete"
                :autofocus="autofocus"
                :class="elementclass"
                :disabled="disabled"
                :placeholder="placeholder"
                :readonly="readonly"
                :type="type === 'password' && visible ? 'text' : type"
                :value="modelValue"
                @focus="$emit('focus', event)"
                @input="updateModel($event)"
            >

            <div
                v-if="type === 'password'"
                class="eye"
                :class="{visible}"
                @click="visible = !visible"
            >
                <Icon class="icon icon-mini" :class="{active: visible}" name="Eye" />
            </div>
        </div>
        <div v-if="help" class="help">
            {{ help }}
        </div>
    </div>
</template>

<script>
import Field from './field'

export default {
    data() {
        return {
            visible: false,
        }
    },
    emits: ['focus', 'update:modelValue'],
    extends: Field,
    props: {
        type: {
            default: 'text',
            type: String,
            validator: function(value) {
                return ['password', 'text'].includes(value)
            },
        },
    },
}
</script>

<style lang="postcss">
.c-field-text {
    display: flex;
    flex-direction: column;

    & .input-container {
        align-items: center;
        display: flex;

        & input {
            background: none;
            border: none;
            border-bottom: var(--border) solid var(--grey-200);
            color: var(--grey-50);
            font-size: 1rem;
            height: var(--space-2);
            outline: none;

            &:focus {
                border-bottom: var(--border) solid var(--primary-color);
            }
        }

        & .icon {

            &:hover {
                cursor: pointer;
            }

            &.active {
                color: var(--primary-color);
            }
        }
    }

    & label {
        margin: var(--spacer) 0;
    }
}
</style>
