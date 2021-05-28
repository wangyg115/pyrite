<template>
    <div class="app-view theme theme-dark" :class="{connected: $s.group.connected, 'chat-active': $s.chat.active}">
        <div class="presence">
            <header>
                <RouterLink v-if="!$s.group.connected" class="logo" :to="{name: 'main'}">
                    <Icon class="icon" name="Logo" />PYRITE
                </RouterLink>
                <div v-else class="logo no-back-link">
                    <Icon class="icon" name="Logo" />PYRITE
                </div>

                <div class="version">
                    {{ version }}
                </div>
            </header>
            <Users v-if="$s.group.connected" />
            <Groups v-else />
        </div>

        <GeneralControls />
        <Chat v-if="$s.group.connected && $s.chat.active" />
        <RouterView />
        <RoomControls v-if="$s.group.connected" />
        <Notifications />
    </div>
</template>

<script>
import Chat from './components/Chat.vue'
import GeneralControls from './components/GeneralControls.vue'
import Groups from './components/Groups.vue'
import Notifications from './components/Notifications.vue'
import RoomControls from './components/RoomControls.vue'
import Users from './components/Users.vue'

export default {
    components: {Chat, GeneralControls, Groups, Notifications, RoomControls, Users},
    data() {
        return {
            version: import.meta.env.VITE_VERSION,
        }
    },
    name: 'App',
}
</script>

<style lang="postcss">
.app-view {
    align-items: stretch;
    display: grid;
    grid-template-columns: 300px var(--space-4) 1fr;
    height: 100vh;

    & header {

        & .logo {
            align-items: center;
            color: var(--primary-color);
            display: flex;
            font-family: var(--font-secondary);
            justify-content: center;

            &.no-back-link:hover {
                cursor: not-allowed;
            }

            & .icon {
                height: 50px;
                transform: scale(1.25);
                width: 50px;
            }
        }
    }

    &.connected {
        grid-template-columns: 300px var(--space-4) 1fr var(--space-4);

        &.chat-active {
            grid-template-columns: 300px var(--space-4) min-content 1fr var(--space-4);
        }
    }
}
</style>
