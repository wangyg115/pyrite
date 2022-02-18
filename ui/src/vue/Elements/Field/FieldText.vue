<template>
    <div class="c-field-text field" :class="className">
        <label v-if="label" class="field-label" :for="name">{{ label }}</label>
        <div class="input-container">
            <input
                ref="field"
                :autocomplete="autocomplete"
                :autofocus="autofocus"
                :class="elementclass"
                :disabled="disabled"
                :placeholder="placeholder"
                :readonly="readonly"
                :type="type === 'password' && visible ? 'text' : type"
                :value="modelValue"
                @click.stop="$emit('focus', event)"
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
        <div v-if="validation" class="validation-message">
            <template v-if="validation.$invalid && validation.$dirty">
                <div
                    v-for="error of validation.$silentErrors"
                    :key="error.$propertyPath"
                    class="error ucfl"
                >
                    {{ error.$message }}
                </div>
            </template>
        </div>
        <div v-if="help" class="help">
            {{ help }}
        </div>
    </div>
</template>

<script>
import Field from './field'
import {nextTick} from 'vue'

export default {
    computed: {
        className() {
            const classes = {}
            if (this.validation) {
                classes.validation = true
                if (this.validation.$invalid && this.validation.$dirty) {
                    classes.invalid = true
                }
            }
            return classes
        },
    },
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
        validation: {
            default: () => null,
            required: false,
            type: Object,
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
    position: relative;

    &.validation {

        &.invalid {

            .input-container {

                input {
                    border-bottom: var(--border) solid var(--error-color);
                }
            }
        }

        .validation-message {
            bottom: calc(-1 * var(--spacer));
            color: var(--error-color);
            flex: 1;
            font-size: var(--text-s);
            height: var(--space1);
            min-height: var(--space-1);
            position: absolute;
        }
    }

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
        text-transform: capitalize;
    }

    .help {

        &::first-letter {
            text-transform: capitalize;
        }
    }
}
</style>
