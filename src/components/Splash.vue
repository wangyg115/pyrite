<template>
    <div class="c-splash">
        <Icon class="icon logo-animated" name="Logo" />
        <div class="title">
            PYRITE
        </div>

        <div class="propaganda">
            Video Communication
        </div>
    </div>
</template>

<style lang="postcss">
.c-splash {
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;

    & .icon {
        height: 50%;
        width: 50%;
    }

    & .title {
        color: var(--primary-color);
        font-family: var(--font-mono);
        font-size: var(--text-huge);
        font-weight: 600;
    }

    & .propaganda {
        color: var(--grey-200);
        font-size: var(--text-large);
        font-style: italic;
        font-weight: 500;
        text-align: center;
    }
}
</style>
