<template>
    <div class="c-field-number field">
        <div class="label-container">
            <label class="field-label uc" :for="uniqueId">{{ label }}</label>
            <slot class="label-extra" name="header" />
        </div>
        <input
            :id="uniqueId" v-model.number="model"
            :placeholder="placeholder"
            type="number"
        >

        <div v-if="help" class="help ucfl">
            {{ help }}
        </div>
    </div>
</template>

<script>
export default {
    beforeMount() {
        this.uniqueId = Math.random().toString(36).substr(2, 9)
    },
    computed: {
        model: {
            get: function() {
                return this.modelValue
            },
            set: function(value) {
                this.$emit('update:modelValue', value)
            },
        },
    },
    emits: ['update:modelValue'],
    props: {
        help: {
            default: () => '',
            type: String,
        },
        label: {
            default: () => 'Label me',
            type: String,
        },
        modelValue: {
            required: true,
            type:Number,
        },
        options: {
            default: () => [],
            type: Array,
        },
        placeholder: {
            default: () => '...',
            type: String,
        },
    },
}
</script>

<style lang="scss">
.c-field-number {

    input {
        background: none;
        border: none;
        border-bottom: var(--border) solid var(--grey-5);
        color: var(--grey-7);
        max-width: 80px;
        outline: none;
        padding: var(--space-05);
    }
}
</style>
