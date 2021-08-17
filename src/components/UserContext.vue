<template>
    <div v-click-outside="toggleMenu.bind(this)" class="c-user-context context-menu" :class="{active}">
        <Icon class="icon icon-small" name="Menu" @click="toggleMenu" />
        <div v-if="active" class="actions">
            <button
                v-if="user.id !== $s.user.id" class="action"
                @click="activateUserChat"
            >
                <Icon class="icon icon-mini" name="Chat" />{{ `${$t('Chat with')} ${user.username}` }}
            </button>
            <button v-if="user.id !== $s.user.id && $s.permissions.op" class="action" @click="muteUser">
                <Icon class="icon icon-mini" name="Mic" />{{ `${$t('Mute')} ${user.username}` }}
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
                    <Icon class="icon icon-mini" name="Present" />{{ $t('Remove Presenter role') }}
                </template>
                <template v-else>
                    <Icon class="icon icon-mini" name="Present" />{{ $t('Add Presenter role') }}
                </template>
            </button>
            <ContextInput v-if="$s.permissions.op && user.id !== $s.user.id" v-model="warning" :submit="sendNotification" />
            <ContextSelect
                v-if="user.id === $s.user.id" v-model="$s.user.status.availability"
                icon="Present"
                :options="statusOptions"
                :submit="setAvailability"
                :title="$t('Change status')"
            />
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            active: false,
            kick: {icon: 'Logout', title: `${this.$t('Kick')} ${this.user.username}`},
            statusOptions: [
                {id: 'available', name: this.$t('Available')},
                {id: 'away', name: this.$t('Away')},
                {id: 'busy', name: this.$t('Busy')},
            ],
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
                    name: this.user.username,
                    unread: 0,
                },
                channelId: this.user.id,
            })

            this.toggleMenu()
        },
        kickUser(text) {
            app.notifier.message('kicked', {dir: 'source', target: this.user.username})
            app.connection.userAction('kick', this.user.id, text)
            this.toggleMenu()
        },
        muteUser() {
            app.notifier.message('mute', {dir: 'source', target: this.user.username})
            app.connection.userMessage('mute', this.user.id, null)
            this.toggleMenu()
        },
        sendNotification(message) {
            app.notifier.message('notify', {dir: 'source', message, target: this.user.username})
            app.connection.userMessage('notify', this.user.id, message)
            this.toggleMenu()
        },
        setAvailability(availability) {
            app.connection.userAction('setstatus', app.connection.id, {availability})
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
            let action
            if (this.user.permissions.op) action = 'unop'
            else action = 'op'

            app.notifier.message(action, {dir: 'source', target: this.user.username})
            app.connection.userAction(action, this.user.id)
            this.toggleMenu()
        },
        togglePresenter() {
            let action
            if (this.user.permissions.present) action = 'unpresent'
            else action = 'present'

            app.notifier.message(action, {dir: 'source', target: this.user.username})
            app.connection.userAction(action, this.user.id)
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
