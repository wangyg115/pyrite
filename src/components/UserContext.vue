<template>
    <div v-click-outside="toggleMenu.bind(this)" class="c-user-context context-menu" :class="{active}">
        <Icon class="icon icon-small" name="Menu" @click="toggleMenu" />
        <div v-if="active" class="actions">
            <button
                v-if="user.id !== $s.user.id" class="action"
                @click="activateUserChat"
            >
                <Icon class="icon icon-mini" name="Chat" />{{ `${$t('Chat with')} ${user.name}` }}
            </button>
            <button v-if="user.id !== $s.user.id && $s.permissions.op" class="action" @click="muteUser(user)">
                <Icon class="icon icon-mini" name="Mic" />{{ `${$t('Mute')} ${user.name}` }}
            </button>
            <button v-if="user.id !== $s.user.id && $s.permissions.op" class="action" @click="kickUser(user)">
                <Icon class="icon icon-mini" name="Logout" />{{ `${$t('Kick')} ${user.name}` }}
            </button>
            <button v-if="user.id !== $s.user.id && $s.permissions.op" class="action" @click="toggleOperator(user)">
                <template v-if="user.permissions.op">
                    <Icon class="icon icon-mini" name="Operator" />{{ $t('Remove Operator role') }}
                </template>
                <template v-else>
                    <Icon class="icon icon-mini" name="Operator" />{{ $t('Add Operator role') }}
                </template>
            </button>
            <button v-if="user.id !== $s.user.id && $s.permissions.op" class="action" @click="togglePresenter(user)">
                <template v-if="user.permissions.present">
                    <Icon class="icon icon-mini" name="Present" />{{ $t('Remove Present role') }}
                </template>
                <template v-else>
                    <Icon class="icon icon-mini" name="Present" />{{ $t('Add Present role') }}
                </template>
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
        kickUser(user) {
            app.connection.userAction('kick', user.id)
            this.toggleMenu()
        },
        muteUser(user) {
            app.connection.userMessage('mute', user.id)
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
        toggleOperator(user) {
            if (user.permissions.op) app.connection.userAction('unop', user.id)
            else app.connection.userAction('op', user.id)
            this.toggleMenu()
        },
        togglePresenter(user) {
            if (user.permissions.present) app.connection.userAction('unpresent', user.id)
            else app.connection.userAction('present', user.id)
            this.toggleMenu()
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
