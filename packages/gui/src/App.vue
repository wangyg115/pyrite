<template>
    <RouterView />
    <Notifications />
</template>

<script>
import Notifications from './components/Notifications.vue'

export default {
    components: {Notifications},

}
</script>

<style lang="scss">
.app {
    align-items: stretch;
    background: var(--grey-1);
    display: grid;
    grid-template-columns: 300px var(--space-4) 1fr;
    height: 100vh;
    overflow: hidden;
}
</style>
