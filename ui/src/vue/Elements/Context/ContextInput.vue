<template>
    <div class="c-context-input">
        <transition mode="out-in" name="c-context-input-fade" @after-leave="inputTransitioned">
            <div v-if="input && !revert" class="action-input">
                <FieldText v-model="text" :autofocus="inputTransition" @keyup.enter="submitMethod" />

                <button
                    v-if="required && text === ''" class="btn tooltip tooltip-right"
                    @click="input = !input"
                >
                    <Icon class="icon icon-mini" name="Close" />
                </button>
                <button
                    v-else class="btn tooltip tooltip-right"
                    :data-tooltip="$t('Submit')"
                    @click="submitMethod"
                >
                    <Icon class="icon icon-mini" name="Send" />
                </button>
            </div>
            <button v-else class="action" @click="buttonAction">
                <Icon class="icon icon-mini" :name="icon" />{{ title }}
            </button>
        </transition>
    </div>
</template>

<script>
export default {
    computed: {
        icon() {
            if (typeof this.modelValue.icon === 'string') return this.modelValue.icon
            return this.modelValue.icon()
        },
        title() {
            if (typeof this.modelValue.title === 'string') return this.modelValue.title
            return this.modelValue.title()
        },
    },
    data() {
        return {
            input: false,
            inputTransition: false,
            text: '',
        }
    },
    emits: ['submit', 'update:modelValue'],
    methods: {
        buttonAction() {
            if (this.revert) {
                this.submitMethod()
            } else {
                this.input = !this.input
            }
        },
        inputTransitioned() {
            this.inputTransition = this.input
        },
        async submitMethod() {
            await this.submit(this.text)
            // Reset text and hide input again.
            this.input = false
            this.text = ''
        },
    },
    props: {
        modelValue: {
            required: true,
            type: Object,
        },
        required: {
            default: () => true,
            required: false,
            type: Boolean,
        },
        /**
         * Revert is a way to toggle the previous
         * state of an action, without having to go
         * through the input state.
         */
        revert: {
            default: () => false,
            required: false,
            type: Boolean,
        },
        submit: {
            default: () => {},
            required: false,
            type: Function,
        },
    },
}
</script>

<style lang="scss">
.c-context-input {

    &-fade-active,
    &-fade-leave-active {
        transition: opacity 0.25s ease-out;
    }

    &-fade-enter-from,
    &-fade-leave-to {
        opacity: 0;
    }

    .action-input {
        display: flex;
        flex: 1;
        position: relative;

        .field {
            padding: 6px 0;

            input {
                padding: 8px 0;
            }
        }

        .btn {
            bottom: calc(var(--spacer) * 1.5);
            padding: 0;
            position: absolute;
            right: var(--spacer);
        }
    }
}

</style>
