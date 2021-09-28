<template>
    <div
        class="c-user-app app theme-dark" :class="{
            connected: $s.group.connected,
            'chat-hidden': $s.chat.hidden,
            'chat-toggle': chatToggle,
        }"
    >
        <Header>
            <Users v-if="$s.group.connected" /><Groups v-else />
        </Header>

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
import Chat from './Chat.vue'
import GeneralControls from './GeneralControls.vue'
import Groups from './Groups.vue'
import Header from '../Header.vue'
import RoomControls from './RoomControls.vue'
import Users from './Users.vue'

export default {
    components: {Chat, GeneralControls, Groups, Header, RoomControls, Users},
    data() {
        return {
            chatToggle: false,
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
    name: 'UserApp',
}
</script>

<style lang="scss">
.c-user-app {

    &.dashboard {
        grid-template-columns: var(--space-4) 1fr 1fr;
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
