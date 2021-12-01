<template>
    <div
        class="c-conference-app app theme-dark" :class="{
            connected: $s.group.connected,
            'chat-hidden': $s.chat.hidden,
            'chat-toggle': chatToggle,
        }"
    >
        <Header>
            <UsersList v-if="$s.group.connected" /><Groups v-else />
        </Header>

        <ConferenceControls />
        <transition @enter="openChat" @leave="closeChat">
            <GroupChat v-if="$s.group.connected && !$s.chat.hidden" />
            <div v-else />
        </transition>

        <RouterView />
        <GroupControls v-if="$s.group.connected" />
        <Notifications />
    </div>
</template>

<script>
import ConferenceControls from './Controls/Controls.vue'
import GroupChat from './Groups/Group/Chat.vue'
import GroupControls from './Groups/Group/Controls.vue'
import Groups from './Groups/List.vue'
import Header from '@/vue/Elements/Header.vue'
import UsersList from './Users/List/List.vue'

export default {
    components: {ConferenceControls, GroupChat, GroupControls, Groups, Header, UsersList},
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
}
</script>

<style lang="scss">
.c-conference-app {
    grid-template-columns: 300px var(--space-4) 0px 1fr var(--space-4);
    height: 100vh;

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
