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

            <button v-if="$s.permissions.op" class="action" disabled>
                <Icon class="icon icon-mini" name="MicMute" />{{ $t('Mute all Users') }}
            </button>
            <button v-if="$s.permissions.op" class="action" disabled>
                <Icon class="icon icon-mini" name="Lock" />{{ $t('Lock Group') }}
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
        },
    },
}
</script>

