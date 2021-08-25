<template>
    <div
        class="c-app theme-dark"
        :class="{connected: $s.group.connected, 'chat-hidden': $s.chat.hidden, 'chat-toggle': chatToggle}"
    >
        <div class="presence">
            <header>
                <RouterLink v-if="!$s.group.connected" class="logo" :to="{name: 'main'}">
                    <Icon class="icon" name="Logo" />PYRITE
                </RouterLink>
                <div v-else class="logo no-back-link">
                    <Icon class="icon" name="Logo" />PYRITE
                </div>

                <RouterLink
                    class="btn tooltip btn-dashboard" :class="{active: $route.name === 'dashboard'}"
                    :data-tooltip="$t('dashboard')"
                    :to="{name: 'dashboard', params: {tabId: 'groups'}}"
                >
                    <Icon class="icon-small" name="Dashboard" />
                </RouterLink>

                <div class="version">
                    {{ version }}
                </div>
            </header>
            <Users v-if="$s.group.connected" />
            <Groups v-else />
        </div>

        <GeneralControls />
        <transition @enter="openChat" @leave="closeChat">
            <Chat v-if="$s.group.connected && !$s.chat.hidden" />
        </transition>
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
            chatToggle: false,
            version: import.meta.env.VITE_VERSION,
        }
    },
    methods: {
        async closeChat(el, done) {
            el.style.width = `${this.$s.chat.width}px`
            this.chatToggle = true
            app.animate({
                duration: 350,
                from: this.$s.chat.width,
                onFinish: () => {
                    this.chatToggle = false
                    done()
                },
                onUpdate: v => {
                    el.style.width = `${Math.floor(v)}px`
                },
                to: 0,
            })
        },
        async openChat(el, done) {
            el.style.width = '0px'
            this.chatToggle = true
            app.animate({
                duration: 350,
                from: 0,
                onFinish: () => {
                    this.chatToggle = false
                    done()
                },
                onUpdate: v => {
                    el.style.width = `${Math.floor(v)}px`
                },
                to: this.$s.chat.width,
            })
        },
    },
    name: 'App',
}
</script>

<style lang="scss">
.c-app {
    align-items: stretch;
    background: var(--grey-1);
    display: grid;
    grid-template-columns: 300px var(--space-4) 1fr;
    height: 100vh;
    overflow: hidden;

    .presence {

        header {
            align-items: center;
            display: flex;
            justify-content: space-between;

            .logo {
                align-items: center;
                color: var(--primary-color);
                display: flex;
                font-family: var(--font-secondary);
                justify-content: center;

                &.no-back-link:hover {
                    cursor: not-allowed;
                }

                .icon {
                    height: 50px;
                    transform: scale(1.25);
                    width: 50px;
                }
            }

            .version {
                font-family: var(--font-secondary);
                font-style: italic;
            }
        }
    }

    &.connected {
        grid-template-columns: 300px var(--space-4) min-content 1fr var(--space-4);

        .c-chat {
            min-width: 200px;
            opacity: 1;
            transition: opacity 150ms;
        }

        &.chat-hidden {
            grid-template-columns: 300px var(--space-4) 1fr var(--space-4);
        }

        &.chat-toggle {
            grid-template-columns: 300px var(--space-4) min-content 1fr var(--space-4);
        }
    }

    &.chat-toggle {
        overflow: hidden;
        resize: none;

        .c-chat {
            min-width: auto !important;
            opacity: 0.75;

            * {
                overflow: auto;
                overflow-x: hidden;
                resize: none;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}
</style>
