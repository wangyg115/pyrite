<template>
    <div v-click-outside="toggleMenu" class="c-user-context context-menu" :class="{active}">
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
            <template v-if="$s.permissions.op">
                <div v-show="warning.input" class="action-input">
                    <FieldText v-model="warning.message" :autofocus="warning.input" @keyup.enter="sendWarning" />
                    <button v-if="warning.message === ''" class="btn" @click="toggleInput(warning)">
                        <Icon class="icon icon-mini" name="Close" />
                    </button>
                    <button v-else class="btn" @click="sendWarning()">
                        <Icon class="icon icon-mini" name="Send" />
                    </button>
                </div>

                <button v-show="!warning.input" class="action" @click="toggleInput(warning)">
                    <Icon class="icon icon-mini" name="Megafone" />{{ $t('Send Warning') }}
                </button>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            active: false,
            warning: {
                input: false,
                message: '',
            },
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
        sendWarning() {
            app.connection.userMessage('warning', null, this.warning.message, true)
            this.warning.message = ''
            this.warning.input = false
            app.notify({
                level: 'info',
                message: `${this.$t('Warning message was send to all users')}`,
            })
        },
        toggleInput(inputSwitch) {
            inputSwitch.input = !inputSwitch.input
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

