<template>
    <div class="c-field-text field">
        <label v-if="label" class="field-label" :for="name">{{ label }}</label>
        <textarea v-model="modelValue" />
        <div v-if="help" class="help">
            {{ help }}
        </div>
    </div>
</template>

<script>
import Field from './field'
import {nextTick} from 'vue'

export default {
    data() {
        return {
            visible: false,
        }
    },
    emits: ['focus', 'update:modelValue'],
    extends: Field,
    async mounted() {
        if (this.autofocus) this.$refs.field.focus()
    },
    props: {
        type: {
            default: 'text',
            type: String,
            validator: function(value) {
                return ['password', 'text'].includes(value)
            },
        },
    },
    watch: {
        async 'autofocus'(value) {
            if (value) {
                await nextTick()
                this.$refs.field.focus()
            }
        },
    },
}
</script>

<style lang="scss">
.c-field-text {
    display: flex;
    flex-direction: column;
    overflow: auto;

    .input-container {
        align-items: center;
        display: flex;
        width: 100%;

        input {
            background: none;
            border: none;
            border-bottom: var(--border) solid var(--grey-5);
            color: var(--grey-7);
            font-size: 1rem;
            height: var(--space-2);
            outline: none;
            transition: border 0.5s ease;
            width: 100%;

            &[readonly] {
                border-bottom: var(--border) solid transparent;
            }

            &:focus {
                border-bottom: var(--border) solid var(--primary-color);
            }
        }

        .icon {

            &:hover {
                cursor: pointer;
            }

            &.active {
                color: var(--primary-color);
            }
        }
    }

    .field-label {
        font-family: var(--font-secondary);
        margin: var(--spacer) 0;
        text-transform: capitalize;
    }

    .help {

        &::first-letter {
            text-transform: capitalize;
        }
    }
}
</style>
