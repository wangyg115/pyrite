<template>
    <div class="c-manager-app app theme-dark">
        <Header>
            <ManagerUsers v-if="$route.name.startsWith('manager-user')" />
            <ManagerGroups v-else />
        </Header>
        <Controls />
        <RouterView />
        <Notifications />
    </div>
</template>

<script>
import Controls from './Controls.vue'
import Header from '../Header.vue'
import ManagerGroups from './Groups.vue'
import ManagerUsers from './Users.vue'

export default {
    components: {Controls, Header, ManagerGroups, ManagerUsers},
    data() {
        return {
            version: import.meta.env.VITE_VERSION,
        }
    },
}
</script>

<style lang="scss">
.c-manager-app {
    --primary-color-h: 0;
    --primary-color-s: 40%;

    grid-template-columns: 300px var(--space-4) 1fr;
}
</style>
