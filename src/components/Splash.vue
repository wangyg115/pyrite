<template>
    <div class="c-splash">
        <Icon class="icon" name="Logo" />

        <div class="slogan">
            Friendly<br>Video Conferences
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
        opacity: 0.5;
        width: 50%;
    }

    & .slogan {
        color: var(--primary-color);
        font-size: 2rem;
        font-weight: 500;
        opacity: 0.5;
        text-align: center;
    }
}
</style>
