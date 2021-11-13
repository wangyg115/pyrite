<template>
    <div class="c-splash">
        <Icon class="icon logo-animated" name="Logo" />
        <div class="title">
            PYRITE
        </div>

        <div class="propaganda">
            {{ $t('CONFERENCING') }}
        </div>
    </div>
</template>

<script>
export default {
    mounted() {
        if (!this.$s.group.connected) {
            this.$s.group.name = ''
        }
    },
}
</script>

<style lang="scss">
.c-splash {
    align-items: center;
    display: flex;
    flex-direction: column;
    font-family: var(--font-secondary);
    justify-content: center;

    .icon {
        height: 300px;
        transform: scale(1.5);
        width: 300px;
    }

    .title {
        color: var(--primary-color);
        font-size: 3.7rem;
        font-weight: 600;
        height: 3.7rem;
        line-height: 3.7rem;
        margin: 0;
        padding: 0;
    }

    .propaganda {
        color: var(--grey-5);
        font-size: 1.67rem;
        font-weight: 500;
    }
}
</style>
