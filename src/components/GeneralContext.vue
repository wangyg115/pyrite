<template>
    <div v-click-outside="toggleMenu.bind(this)" class="c-user-context context-menu" :class="{active}">
        <Icon class="icon icon-small" name="Menu" @click="toggleMenu" />
        <div v-if="active" class="actions">
            <button
                v-if="$s.permissions.record"
                class="action"
                @click="toggleRecording($s.group.recording)"
            >
                <Icon class="icon icon-mini" name="Record" />
                <span v-if="this.$s.group.recording">{{ $t('Stop Recording') }}</span>
                <span v-else>{{ $t('Start Recording') }}</span>
            </button>

            <button v-if="$s.permissions.op" class="action" @click="muteAllUsers">
                <Icon class="icon icon-mini" name="MicMute" />{{ $t('Mute Participants') }}
            </button>
            <button
                v-if="$s.permissions.op" class="action"
                @click="toggleLockGroup"
            >
                <Icon class="icon icon-mini" name="Lock" />
                <span v-if="this.$s.group.locked">{{ $t('Unlock Group') }}</span>
                <span v-else>{{ $t('Lock Group') }}</span>
            </button>
            <button v-if="$s.permissions.op" class="action" @click="clearChat">
                <Icon class="icon icon-mini" name="ChatRemove" />{{ $t('Clear Chat') }}
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            active: false,
        }
    },
    methods: {
        clearChat() {
            app.connection.groupAction('clearchat')
            this.toggleMenu()
        },
        muteAllUsers() {
            app.connection.userMessage('mute', null, null, true)
            app.notify({
                level: 'info',
                message: `${this.$t('All participants are muted')}`,
            })
            this.active = false
        },
        toggleLockGroup() {
            if (this.$s.group.locked) {
                app.connection.groupAction('unlock')
                app.notify({level: 'info', message: `${this.$t('Group unlocked')}`})
            } else {
                app.connection.groupAction('lock', 'group is locked')
                app.notify({level: 'info', message: `${this.$t('Group locked')}`})
            }

            this.$s.group.locked = !this.$s.group.locked

        },
        toggleMenu(e, forceState) {
            // The v-click-outside
            if (typeof forceState === 'object') {
                this.active = false
                return
            }

            this.active = !this.active
        },
        toggleRecording(isRecording) {
            app.connection.groupAction(isRecording ? 'unrecord' : 'record')
            this.active = false
        },
    },
}
</script>

