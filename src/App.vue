<template>
    <div class="app-view theme theme-dark" :class="{connected: state.connected}">
        <div class="presence">
            <header>
                <RouterLink class="name" :to="{name: 'settings'}">
                    PYRITE
                </RouterLink>
                <div class="version">
                    {{ version }}
                </div>
            </header>
            <Users v-if="state.connected" />
            <Groups v-else />
        </div>

        <GeneralControls />
        <Chat v-if="state.connected" />
        <RoomControls v-if="state.connected" />


        <RouterView />

        <Notifications />
    </div>
</template>

<script>
import Notifications from './components/Notifications.vue'
import Users from './components/Users.vue'
import Chat from './components/Chat.vue'
import GeneralControls from './components/GeneralControls.vue'
import RoomControls from './components/RoomControls.vue'
import Groups from './components/Groups.vue'

export default {
    name: 'App',
    components: {Chat, GeneralControls, Groups, Notifications, RoomControls, Users},
        data() {
        return {
            state: app.state,
            version: import.meta.env.VITE_VERSION,
        }
    },
}
</script>

<style lang="postcss">
.app-view {
    align-items: stretch;
    display: grid;
    grid-template-columns: 250px var(--space-4) 1fr;
    height: 100vh;

    &.connected {
        grid-template-columns: 250px var(--space-4) min-content var(--space-4) 1fr;
    }
}
</style>
