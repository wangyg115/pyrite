<template>
    <div class="c-context-select">
        <button class="action" @click.stop="buttonAction">
            <Icon class="icon icon-mini" :name="icon" /><span class="ucfl">{{ title }} ({{ model.name }})</span>
        </button>

        <FieldSelect
            v-show="input"
            ref="select"
            v-model="model"
            :options="options"
        />
    </div>
</template>

<script>

export default {
    computed: {
        model: {
            get() {return this.modelValue},
            set(modelValue) {this.$emit('update:modelValue', modelValue)},
        },
    },
    data() {
        return {
            input: false,
            text: '',
        }
    },
    emits: ['update:modelValue'],
    methods: {
        async buttonAction() {
            this.input = !this.input
            this.$refs.select.toggleSelect(null, null, true)
        },
        inputTransitioned() {
            this.inputTransition = this.input
        },
        async submitMethod() {
            await this.submit(this.model)
            this.input = false
        },
    },
    props: {
        icon: {
            required: true,
            type: String,
        },
        modelValue: {
            required: true,
            type: Object,
        },
        options: {
            required: true,
            type: Array,
        },
        submit: {
            required: true,
            type: Function,
        },
        title: {
            required: true,
            type: String,
        },
    },
    watch: {
        model() {
            if (this.input) this.submitMethod()
        },
    },
}
</script>

<style lang="scss">
.c-context-select {

    .c-field-select {
        min-width: 200px;

        .input-container {

            .button-wrapper {
                display: none;
            }

            .options {
                margin: 0;
                position: relative;
            }
        }
    }
}
</style>
