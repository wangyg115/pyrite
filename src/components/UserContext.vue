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
            <button v-if="user.id !== $s.user.id && $s.permissions.op" class="action" @click="muteUser">
                <Icon class="icon icon-mini" name="Mic" />{{ `${$t('Mute')} ${user.name}` }}
            </button>

            <ContextInput
                v-if="user.id !== $s.user.id && $s.permissions.op" v-model="kick"
                :required="false"
                :submit="kickUser"
            />

            <button v-if="user.id !== $s.user.id && $s.permissions.op" class="action" @click="toggleOperator">
                <template v-if="user.permissions.op">
                    <Icon class="icon icon-mini" name="Operator" />{{ $t('Remove Operator role') }}
                </template>
                <template v-else>
                    <Icon class="icon icon-mini" name="Operator" />{{ $t('Add Operator role') }}
                </template>
            </button>
            <button v-if="user.id !== $s.user.id && $s.permissions.op" class="action" @click="togglePresenter">
                <template v-if="user.permissions.present">
                    <Icon class="icon icon-mini" name="Present" />{{ $t('Remove Present role') }}
                </template>
                <template v-else>
                    <Icon class="icon icon-mini" name="Present" />{{ $t('Add Present role') }}
                </template>
            </button>
            <ContextInput v-if="$s.permissions.op" v-model="warning" :submit="sendWarning" />
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            active: false,
            kick: {icon: 'Logout', title: `${this.$t('Kick')} ${this.user.name}`},
            warning: {icon: 'Megafone', title: this.$t('Send Notification')},
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
        kickUser(text) {
            app.connection.userAction('kick', this.user.id, text)
            this.toggleMenu()
        },
        muteUser() {
            app.connection.userMessage('mute', this.user.id)
            this.toggleMenu()
        },
        sendWarning(text) {
            app.connection.userMessage('warning', this.user.id, text, true)
            app.notify({
                level: 'info',
                message: `${this.$t('Notification has been sent to user {user}', {user: this.user.name})}`,
            })
        },
        toggleMenu(e, forceState) {
            // The v-click-outside
            if (typeof forceState === 'object') {
                this.active = false
                return
            }

            this.active = !this.active
        },
        toggleOperator() {
            if (this.user.permissions.op) app.connection.userAction('unop', this.user.id)
            else app.connection.userAction('op', this.user.id)
            this.toggleMenu()
        },
        togglePresenter() {
            if (this.user.permissions.present) app.connection.userAction('unpresent', this.user.id)
            else app.connection.userAction('present', this.user.id)
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
