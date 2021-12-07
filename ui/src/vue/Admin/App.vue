<template>
    <div class="c-admin-app app" :class="`theme-${$s.theme.id}`">
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
    mounted() {
        const themeColor = getComputedStyle(document.querySelector('.app')).getPropertyValue('--grey-4')
        document.querySelector('meta[name="theme-color"]').content = themeColor
    },
}
</script>

<style lang="scss">
.c-admin-app {
    // Tone down greys to keep it clean...
    --grey-h: 0;
    --grey-s: 5%;
    --primary-color-h: 0;
    --primary-color-s: 40%;
    --primary-color: hsl(var(--primary-color-h) var(--primary-color-s) 65%);

    grid-template-columns: 300px var(--space-4) 1fr;
}
</style>
