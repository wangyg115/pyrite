<template>
    <div class="c-hint">
        <Icon class="item-icon icon-small" name="Info" />
        <div class="explanation">
            {{ text }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            default() {return ''},
        },
    },
}
</script>

<style lang="scss">
.c-hint {
    align-items: center;
    display: flex;

    .icon {
        color: var(--primary-color);
        margin-right: var(--spacer);
    }

    .explanation {
        color: var(--grey-7);
        font-size: var(--text-small);
        font-style: italic;
    }
}

</style>
