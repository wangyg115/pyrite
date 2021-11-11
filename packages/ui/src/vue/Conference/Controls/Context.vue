<template>
    <div v-click-outside="toggleMenu" class="c-general-context context-menu" :class="{active}">
        <button class="btn btn-menu no-feedback">
            <Icon class="icon icon-small" name="Menu" @click="toggleMenu" />
        </button>
        <div v-show="active" class="actions">
            <button
                v-if="$s.permissions.record"
                class="action"
                @click="toggleRecording($s.group.recording)"
            >
                <Icon class="icon icon-mini" name="Record" />
                <span v-if="$s.group.recording">{{ $t('Stop Recording') }}</span>
                <span v-else>{{ $t('Start Recording') }}</span>
            </button>

            <button v-if="$s.permissions.op" class="action" @click="muteAllUsers">
                <Icon class="icon icon-mini" name="MicMute" />{{ $t('Mute Participants') }}
            </button>

            <ContextInput
                v-if="$s.permissions.op" v-model="lock"
                :revert="$s.group.locked"
                :submit="toggleLockGroup"
            />

            <button v-if="$s.permissions.op" class="action" @click="clearChat">
                <Icon class="icon icon-mini" name="ChatRemove" />{{ $t('Clear Chat') }}
            </button>

            <ContextInput v-if="$s.permissions.op" v-model="warning" :submit="sendNotification" />
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            active: false,
            lock: {
                icon: () => this.$s.group.locked ? 'Unlock' : 'Lock',
                title: () => this.$s.group.locked ? this.$t('Unlock Group') : this.$t('Lock Group'),
            },
            warning: {icon: 'Megafone', title: this.$t('Send Notification')},
        }
    },
    methods: {
        clearChat() {
            app.connection.groupAction('clearchat')
            this.toggleMenu()
        },
        muteAllUsers() {
            app.connection.userMessage('mute', null, null)
            this.active = false
        },
        sendNotification(text) {
            app.connection.userMessage('notification', null, text)
        },
        toggleLockGroup(text) {
            if (this.$s.group.locked) {
                app.connection.groupAction('unlock')
            } else {
                app.connection.groupAction('lock', text)
            }
        },
        toggleMenu(e, forceState) {
            // The v-click-outside
            if (typeof forceState === 'object') {
                this.active = false
            } else {
                this.active = !this.active
            }

            // Undo input action context state when there is no text yet...
            if (!this.active && this.warning.message === '') {
                this.warning.input = false
            }
        },
        toggleRecording(isRecording) {
            app.connection.groupAction(isRecording ? 'unrecord' : 'record')
        },

    },
}
</script>

