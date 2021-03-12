<template>
    <div class="app-view theme theme-dark" :class="{connected: state.connected, 'chat-active': state.chat.active}">
        <div class="presence">
            <header>
                <RouterLink class="logo" :to="{name: 'settings', params: {tabId: 'misc'}}">
                    <icon class="icon icon-small" name="logo" />PYRITE VIDEO
                </RouterLink>
                <div class="version">
                    {{ version }}
                </div>
            </header>
            <Users v-if="state.connected" />
            <Groups v-else />
        </div>

        <GeneralControls />
        <Chat v-if="state.connected && state.chat.active" />
        <RouterView />
        <RoomControls v-if="state.connected" />
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
    }
}
</script>

<style lang="postcss">
.app-view {
    align-items: stretch;
    display: grid;
    grid-template-columns: 300px var(--space-4) 1fr;
    height: 100vh;

    & .logo {
        align-items: center;
        display: flex;
        justify-content: center;
    }

    &.connected {
        grid-template-columns: 300px var(--space-4) 1fr var(--space-4);

        &.chat-active {
            grid-template-columns: 300px var(--space-4) min-content 1fr var(--space-4);
        }
    }
}
</style>
