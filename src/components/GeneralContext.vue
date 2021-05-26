<template>
    <div v-click-outside="toggleMenu.bind(this)" class="c-user-context context-menu" :class="{active}">
        <Icon class="icon icon-small" name="Menu" @click="toggleMenu" />
        <div v-if="active" class="actions">
            <button v-if="$s.permissions.op" class="action" disabled>
                <Icon class="icon icon-mini" name="Record" /> Start Recording
            </button>
            <button v-if="$s.permissions.op" class="action" disabled>
                <Icon class="icon icon-mini" name="MicMute" />Mute all Users
            </button>
            <button v-if="$s.permissions.op" class="action" disabled>
                <Icon class="icon icon-mini" name="Lock" />Lock Group
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
    },
}
</script>

