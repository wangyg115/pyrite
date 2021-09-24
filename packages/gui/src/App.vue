<template>
    <RouterView />
    <!-- <ManagerApp v-if="$route.name && $route.name.startsWith('manager')" />
    <UserApp v-else /> -->
    <Notifications />
</template>

<script>
import ManagerApp from './components/Manager/App.vue'
import Notifications from './components/Notifications.vue'
import UserApp from './components/User/App.vue'

export default {
    components: {ManagerApp, Notifications, UserApp},

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
