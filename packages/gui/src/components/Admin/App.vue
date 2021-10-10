<template>
    <div class="c-admin-app app theme-dark">
        <Header>
            <AdminUsers v-if="$route.name.startsWith('admin-users')" />
            <AdminGroups v-else />
        </Header>
        <Controls />
        <RouterView />
        <Notifications />
    </div>
</template>

<script>
import AdminGroups from './Groups.vue'
import AdminUsers from './Users.vue'
import Controls from './Controls.vue'
import Header from '../Header.vue'

export default {
    components: {AdminGroups, AdminUsers, Controls, Header},
    data() {
        return {
            version: import.meta.env.VITE_VERSION,
        }
    },
}
</script>

<style lang="scss">
.c-admin-app {
    --primary-color-h: 0;
    --primary-color-s: 40%;

    grid-template-columns: 300px var(--space-4) 1fr;
}
</style>
