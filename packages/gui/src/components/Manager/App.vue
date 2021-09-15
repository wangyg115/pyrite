<template>
    <div class="c-manager-app theme-dark">
        <Controls />
        <Login v-if="$s.manager.authenticated" />

        <RouterView />
    </div>
</template>

<script>
import Controls from './Controls.vue'
import Login from './Login.vue'

export default {
    components: {Controls, Login},
}
</script>

<style lang="scss">
.c-manager-app {
    align-items: stretch;
    background: var(--grey-1);
    display: grid;
    grid-template-columns: var(--space-4) 1fr;
    height: 100vh;
    overflow: hidden;
}
</style>
