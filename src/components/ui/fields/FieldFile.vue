<template>
    <label class="c-field-file">
        <Icon class="icon icon-small" name="playFile" />
        <input
            ref="input"
            accept="audio/*,video/*"
            multiple
            type="file"
            @change="previewFiles"
            @click="resetInput"
        >
    </label>
</template>
<script>
import Field from './field'
export default {
    extends: Field,
    props: {
        modelValue: {
            type:Object,
            required: true
        }
    },
    emits: ['file', 'update:modelValue'],
    data() {
        return {
            files: this.modelValue,
            visible: false,
        }
    },
    methods: {
        previewFiles(event) {
            const files = event.target.files
            for(let i = 0; i < files.length; i++) {
                this.$emit('file', files[i])
                this.files.push(files[i].name)
                this.$emit('update:modelValue', [...this.files])
            }
        },
        resetInput(e) {
            // Used to undo the action that is triggered by
            // adding one or more files.
            if (this.modelValue.length) {
                console.log('RESET')
                e.preventDefault()
                this.$refs.input.value = ''
                this.$emit('file', null)
                this.files = []
                this.$emit('update:modelValue', [...this.files])
            }
        }
    }
}
</script>
<style lang="postcss">
.c-field-file {
    align-items: center;
    display: flex;
    height: var(--space-4);
    justify-content: center;
    left: 0;
    position: absolute;
    width: var(--space-4);

    & input {
        color: var(--grey-100);
        height: var(--space-4);
        left: 0;
        outline: none;
        position: absolute;
        width: var(--space-4);

        &::-webkit-file-upload-button {
            outline: none;
            visibility: hidden;
        }

        &:hover {
            cursor: pointer;
        }
    }
}
</style>