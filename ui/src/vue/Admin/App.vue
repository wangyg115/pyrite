<template>
    <div class="c-admin-app app theme-dark">
        <Header>
            <UsersList v-if="$route.name.startsWith('admin-users')" />
            <GroupsList v-else />
        </Header>
        <Controls />
        <RouterView />
        <Notifications />
    </div>
</template>

<script>
import Controls from './Controls.vue'
import GroupsList from './Groups/List.vue'
import Header from '@/vue/Elements/Header.vue'
import UsersList from './Users/List.vue'

export default {
    components: {Controls, GroupsList, Header, UsersList},
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
