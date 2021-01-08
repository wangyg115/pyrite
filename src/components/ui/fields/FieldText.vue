<template>
    <div class="c-field-text field">
        <label class="c-text__label field__label ca" :for="name">{{ label }}</label>
        <div class="c-text__container">
            <input
                :autocomplete="autocomplete"
                :autofocus="autofocus"
                class="c-text__element field__element"
                :class="elementclass"
                :disabled="disabled"
                :placeholder="placeholder"
                :readonly="readonly"
                type="text"
                :value="modelValue"
                @input="updateModel($event)"
            >
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
}
</script>

<style lang="postcss">
.c-field-text {
    display: flex;
    flex-direction: column;

    & input {
        border: var(--border) solid var(--grey-300);
    }

    & label {
        margin-bottom: var(--spacer);
    }
}
</style>