<template>
    <div v-click-outside="toggleSelect.bind(this)" class="c-field-select field">
        <label class="field-label" :for="name">{{ label }}</label>

        <div class="input-container">
            <div class="button-wrapper">
                <input
                    v-if="options && options.length"
                    :id="name"
                    ref="input"
                    v-model="searchQuery"
                    autocomplete="off"
                    :disabled="disabled"
                    :placeholder="currentOption"
                    :readonly="!search"
                    @click="searchSelect($event, null, null, false)"
                    @input="searchSelect($event, null, 'query', false)"
                    @keydown.down="searchSelect($event, null, 'down', false)"
                    @keydown.page-down="searchSelect($event, null, 'page-down', false)"
                    @keydown.page-up="searchSelect($event, null, 'page-up', false)"
                    @keydown.up="searchSelect($event, null, 'up', false)"
                    @keyup.enter="searchSelect($event, null, 'enter', true)"
                    @keyup.escape="active = false"
                >

                <slot class="button" name="button" />
            </div>

            <div v-show="active" ref="options" class="options">
                <div
                    v-for="option in filteredOptions"
                    :id="`option-${option.id}`"
                    :key="option.id"
                    class="option"
                    :class="{selected: searchSelected.id === option.id}"
                    @click="searchSelect($event, option, null, true)"
                >
                    {{ option.name }}
                </div>
            </div>
        </div>
        <div v-if="searchSelected.help" class="help">
            {{ searchSelected.help }}
        </div>
        <div v-else-if="help" class="help">
            {{ help }}
        </div>
    </div>
</template>

<script>
import Field from './field'

export default {
    computed: {
        currentOption() {
            if (this.modelValue) {
                const currentOption = this.options.find((o) => o.id === this.modelValue)
                console.log("CURRENT OPTION", this.modelValue)
                if (currentOption) {
                    return currentOption.name
                }
            }
            return this.placeholder
        },
        filteredOptions() {
            let filteredOptions = []
            for (const option of this.options) {
                // Case insensitive search.
                if (option.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                    filteredOptions.push(option)
                }
            }
            return filteredOptions
        },
    },
    data: function() {
        return {
            active: false,
            searchQuery: '',
            searchSelected: this.modelValue,
            selectedOption: null,
        }
    },
    emits: ['update:modelValue'],
    extends: Field,
    methods: {
        emptySelectOption: function() {
            // Handle syncing an empty option to the model.
            let emptyOption = {id: null, name: null}
            // Use the first option to determine additional keys.
            if (this.options.length) {
                for (let key of Object.keys(this.options[0])) {
                    emptyOption[key] = null
                }
            }
            return emptyOption
        },
        navigate(keyModifier) {
            if (keyModifier === 'enter') {
                if (!this.searchSelected.id) this.selectedOption = this.filteredOptions[0]
                else {
                    this.selectedOption = this.searchSelected
                }
            } else if (['up', 'down', 'page-down', 'page-up'].includes(keyModifier)) {
                if (!this.searchSelected.id) this.selectedOption = this.filteredOptions[0]
                else {
                    const itemIndex = this.filteredOptions.findIndex((i) => i.id === this.searchSelected.id)
                    if (keyModifier === 'down' && this.filteredOptions.length > itemIndex) {
                        this.selectedOption = this.filteredOptions[itemIndex + 1]
                    } else if (keyModifier === 'up' && itemIndex > 0) {
                        this.selectedOption = this.filteredOptions[itemIndex - 1]
                    } else if (keyModifier === 'page-down') {
                        if (this.filteredOptions.length >= itemIndex + 5) {
                            this.selectedOption = this.filteredOptions[itemIndex + 5]
                        }
                    } else if (keyModifier === 'page-up') {
                        if (this.filteredOptions.length >= itemIndex - 5 && (itemIndex - 5) >= 0) {
                            this.selectedOption = this.filteredOptions[itemIndex - 5]
                        }
                    }
                }
            } else if (keyModifier === 'query') {
                this.selectedOption = this.filteredOptions[0]
            }
        },
        searchSelect(event, option, keyModifier, updateModel) {
            this.active = true

            if (option) {
                // Option click select.
                this.selectedOption = option
            } else if (keyModifier) {
                this.navigate(keyModifier)
            } else {
                // Click/focus.
                if (!this.searchSelected.id) this.selectedOption = this.filteredOptions[0]
                else this.selectedOption = this.searchSelected
            }

            if (this.selectedOption) {
                this.searchSelected = this.selectedOption
                if (updateModel) {
                    this.searchQuery = ''
                    this.active = false
                    this.searchPlaceholder = this.selectedOption.name
                    this.$emit('update:modelValue', {...this.selectedOption})
                } else {
                    this.active = true
                }
            }
        },
        toggleSelect(e, vClickOutside, active) {
            if (typeof vClickOutside === 'object' && !active) {
                this.active = false
                return
            }

            if (active !== undefined) this.active = active
            else this.active = !this.active
        },
        updateModel: function(event) {
            let value = event.target.value
            if (!value) {
                this.$emit('update:modelValue', this.emptySelectOption())
            } else {
                for (const option of this.options) {
                    if (option.id === value) {
                        this.$emit('update:modelValue', {...option})
                    }
                }
            }
        },
    },
    props: {
        disabled: {
            default: () => false,
            type: Boolean,
        },
        empty: {
            default: 'no options available',
            type: String,
        },
        idfield: {
            default: () => 'id',
            type: String,
        },
        modelValue: {
            required: true,
            type:Object,
        },
        options: {
            default: () => [],
            type: Array,
        },
        placeholder: {
            default: () => '...',
            type: String,
        },
        search: {
            default: false,
            type: Boolean,
        },
    },
    updated() {
        const input = this.$refs.input
        const options = this.$refs.options
        let selected
        if (this.searchSelected.id) {
            selected = document.querySelector(`#option-${this.searchSelected.id}`)
        }

        if (selected) {
            options.scrollTop = selected.offsetTop - input.offsetHeight - selected.offsetHeight
        }
    },
}
</script>

<style lang="scss">
.c-field-select {
    max-width: 350px;
    width: 100%;

    label {
        font-family: var(--font-secondary);
    }

    .input-container {
        display: flex;
        flex-direction: column;
        position: relative;
        width: 100%;

        .button-wrapper {
            display: flex;
            z-index: 1000;

            input {
                background: none;
                border: 0;
                border-bottom: 1px solid var(--grey-5);
                font-size: 1rem;
                height: var(--space-2);
                outline: none;
                user-select: none;
                width: 100%;

                &::placeholder {
                    color: var(--grey-7);
                    font-style: italic;
                }

                &:hover {
                    cursor: pointer;
                }

                &[disabled] {

                    &::placeholder {
                        color: var(--grey-5);
                    }

                    &:hover {
                        cursor: not-allowed;
                    }
                }
            }
        }

        .options {
            background: var(--grey-3);
            border: 1px solid var(--grey-4);
            box-shadow: 0 0 var(--border) rgba(var(--grey-2), 0.8);
            margin-top: calc(var(--space-2) + 1px);
            max-height: 162px;

            max-width: inherit;
            overflow-y: auto;
            position: absolute;
            width: inherit;
            z-index: 100000;

            .option {
                color: var(--grey-6);
                padding: var(--spacer);
                text-align: left;
                user-select: none;
                width: inherit;

                &.selected {
                    background: var(--grey-4);
                    color: var(--primary-color);
                }

                &:hover {
                    background: var(--grey-4);
                    color: var(--primary-color);
                    cursor: pointer;
                }
            }
        }
    }
}
</style>
