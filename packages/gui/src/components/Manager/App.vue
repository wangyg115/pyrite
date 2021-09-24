<template>
    <div class="c-manager-app app theme-dark">
        <Header>
            <ManagerGroups />
        </Header>

        <Controls />
        <Login v-if="$s.manager.authenticated" />

        <RouterView />
    </div>
</template>

<script>
import Controls from './Controls.vue'
import Header from '../Header.vue'
import Login from './Login.vue'
import ManagerGroups from './Groups.vue'

export default {
    components: {Controls, Header, Login, ManagerGroups},
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
}
</style>
