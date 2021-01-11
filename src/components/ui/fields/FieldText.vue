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
                <icon class="icon icon-mini" :class="{active: visible}" name="eye" />
            </div>
        </div>
        <div v-if="help" class="c-text__help field__help cf">
            {{ help }}
        </div>
    </div>
</template>
<script>
import Field from './field'
export default {
    extends: Field,
    props: {
        type: {
            default: 'text',
            type: String,
            validator: function (value) {
                return ['password', 'text'].includes(value)
            }
        }

    },
    data() {
        return {
            visible: false,
        }
    }
}
</script>

<style lang="postcss">
.c-field-text {
    display: flex;
    flex-direction: column;

    & .input-container {
        display: flex;
        align-items: center;

        & input {
            background: none;
            border: none;
            color: var(--grey-50);
            font-size: 1rem;
            height: var(--space-2);
            border-bottom: var(--border) solid var(--grey-200);
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