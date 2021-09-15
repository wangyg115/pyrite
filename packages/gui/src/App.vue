<template>
    <ManagerApp v-if="$route.name && $route.name.startsWith('dashboard')" />
    <UserApp v-else />
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
