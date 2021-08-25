<template>
    <div class="c-splash">
        <Icon class="icon logo-animated" name="Logo" />
        <div class="title">
            PYRITE
        </div>

        <div class="propaganda">
            {{ $t('Video Communication') }}
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
        transform: scale(1.25);
        width: 300px;
    }

    .title {
        color: var(--primary-color);
        font-size: var(--text-huge);
        font-weight: 600;
    }

    .propaganda {
        color: var(--grey-5);
        font-size: var(--text-large);
        font-weight: 500;
    }
}
</style>
