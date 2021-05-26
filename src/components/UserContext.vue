<template>
    <div v-click-outside="toggleMenu.bind(this)" class="c-user-context context-menu" :class="{active}">
        <Icon class="icon icon-small" name="Menu" @click="toggleMenu" />
        <div v-if="active" class="actions">
            <button v-if="user.id === $s.user.id" class="action" disabled>
                <Icon class="icon icon-mini" name="Refresh" />Renegotiate Media
            </button>
            <button
                v-if="user.id !== $s.user.id" class="action"
                @click="activateUserChat"
            >
                <Icon class="icon icon-mini" name="Chat" />{{ `${$t('Chat with')} ${user.name}` }}
            </button>
            <button v-if="user.id !== $s.user.id" class="action" disabled>
                <Icon class="icon icon-mini" name="Mic" />{{ `${$t('Mute')} ${user.name}` }}
            </button>
            <button v-if="user.id !== $s.user.id" class="action" disabled>
                <Icon class="icon icon-mini" name="Logout" />{{ `${$t('Kick')} ${user.name}` }}
            </button>
            <button v-if="user.id !== $s.user.id" class="action" disabled>
                <Icon class="icon icon-mini" name="Operator" />{{ $t('Make Operator') }}
            </button>
            <button v-if="user.id !== $s.user.id" class="action" disabled>
                <Icon class="icon icon-mini" name="Present" />{{ $t('Make presenter') }}
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            active: false,
        }
    },
    methods: {
        activateUserChat() {
            app.emit('channel', {
                action: 'switch',
                channel: {
                    id: this.user.id,
                    messages: [],
                    name: this.user.name,
                    unread: 0,
                },
                channelId: this.user.id,
            })

            this.toggleMenu()
        },
        toggleMenu(e, forceState) {
            // The v-click-outside
            if (typeof forceState === 'object') {
                this.active = false
                return
            }

            this.active = !this.active
        },
    },
    props: {
        user: {
            required: true,
            type: Object,
        },
    },
}
</script>
