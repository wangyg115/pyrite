<template>
    <div v-click-outside="searchToggle" class="c-field-select field">
        <label :for="name">{{ label }}</label>

        <div class="input-container">
            <div class="button-wrapper">
                <input
                    v-if="options && options.length"
                    :id="name"
                    ref="input"
                    v-model="searchQuery"
                    autocomplete="off"
                    :disabled="disabled"
                    :placeholder="(modelValue && modelValue.id) ? options.find((o) => o.id === modelValue.id).name : placeholder"
                    :readonly="!search"
                    @click="searchSelect($event, null, null, false)"
                    @input="searchSelect($event, null, 'query', false)"
                    @keydown.down="searchSelect($event, null, 'down', false)"
                    @keydown.page-down="searchSelect($event, null, 'page-down', false)"
                    @keydown.page-up="searchSelect($event, null, 'page-up', false)"
                    @keydown.up="searchSelect($event, null, 'up', false)"
                    @keyup.enter="searchSelect($event, null, 'enter', true)"
                    @keyup.escape="visible = false"
                >

                <slot class="button" name="button" />
            </div>

            <div v-show="visible" ref="options" class="options">
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
        <div v-if="help" class="help">
            {{ help }}
        </div>
    </div>
</template>

<script>
import Field from './field'
export default {
    extends: Field,
    props: {
        empty: {
            default: 'no options available',
            type: String,
        },
        idfield: {
            type: String,
            default: () => 'id',
        },
        options: {
            default: () => [],
            type: Array,
        },
        placeholder: {
            type: String,
            default: () => '...'
        },
        search: {
            default: false,
            type: Boolean,
        },
        modelValue: {
            type:Object,
            required: true
        }
    },
    emits: ['update:modelValue'],
    data: function() {
        return {
            searchQuery: '',
            searchSelected: this.modelValue,
            selectedOption: null,
            visible: false,
        }
    },
    computed: {
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
            this.visible = true

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
                    this.visible = false
                    this.searchPlaceholder = this.selectedOption.name
                    this.$emit('update:modelValue', {...this.selectedOption})
                } else {
                    this.visible = true
                }
            }
        },
        searchToggle(event, el, visible) {
            this.visible = visible
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
    }
}
</script>
<style lang="postcss">

.c-field-select {
    max-width: 350px;
    width: 100%;

    & .input-container {
        display: flex;
        flex-direction: column;
        position: relative;
        width: 100%;

        & .button-wrapper {
            display: flex;
            z-index: 1000;

            & input {
                background: var(--grey-400);
                border: 0;
                border-bottom: 1px solid var(--grey-200);
                font-size: 1rem;
                height: var(--space-2);
                outline: none;
                user-select: none;
                width: 100%;

                &::placeholder {
                    color: var(--grey-50);
                    font-style: italic;
                }

                &:hover {
                    cursor: pointer;
                }
            }
        }

        & .options {
            background: var(--grey-400);
            border: 1px solid var(--grey-300);
            box-shadow: 0 0 var(--border) rgba(var(--grey-500), 0.8);
            margin-top: calc(var(--space-2) + 1px);
            max-height: 162px;

            max-width: inherit;
            overflow-y: auto;
            position: absolute;
            width: inherit;
            z-index: 100000;

            & .option {
                color: var(--grey-100);
                padding: var(--spacer);
                text-align: left;
                user-select: none;
                width: inherit;

                &.selected {
                    background: var(--grey-300);
                    color: var(--primary-color);
                }

                &:hover {
                    background: var(--grey-300);
                    color: var(--primary-color);
                    cursor: pointer;
                }
            }
        }
    }
}

</style>