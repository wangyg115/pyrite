<template>
    <div class="c-field-multiselect field">
        <div class="label-container">
            <label class="field-label uc" :for="uniqueId">{{ label }}</label>
            <slot class="label-extra" name="header" />
        </div>
        <select :id="uniqueId" v-model="model" multiple>
            <option v-for="option in options" :key="option.id" :value="option.id">
                {{ option.name }}
            </option>
        </select>
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
            type:Object,
        },
        options: {
            default: () => [],
            type: Array,
        },
    },
}
</script>

<style lang="scss">
.c-field-multiselect {

    select {
        background: var(--grey-4);
        border: 1px solid var(--grey-5);
        color: var(--grey-8);
        font-size: var(--font-d);
        min-width: 160px;
    }
}
</style>
