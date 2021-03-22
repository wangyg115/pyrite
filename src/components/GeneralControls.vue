<template>
    <nav class="c-general-controls">
        <div class="navigational-controls">
            <RouterLink
                class="btn btn-menu tooltip" :class="{active: $route.name === 'settings'}"
                :data-tooltip="$t('settings')"
                :to="{name: 'settings', params: {tabId: 'misc'}}"
            >
                <Icon class="icon-small" name="settings" />
            </RouterLink>
            <RouterLink
                v-if="state.group" class="btn btn-menu tooltip"
                :data-tooltip="$t('current group')"
                :to="{name: 'groups', params: {groupId: state.group}}"
            >
                <Icon class="icon-small" name="groups" />
            </RouterLink>
            <button v-else class="btn btn-menu" disabled>
                <Icon class="icon-small" name="groups" />
            </button>
            <button
                v-if="state.connected"
                class="btn btn-menu tooltip"
                :data-tooltip="state.chat.active ? $t('hide chat') : $t('show chat')"
                @click="toggleChatActive"
            >
                <Icon class="icon-small" :name="state.chat.active ? 'chat-close' : 'chat'" />
            </button>
            <button
                v-if="state.connected"
                class="btn btn-menu warning tooltip"
                :data-tooltip="$t('leave group')"
                @click="disconnect"
            >
                <Icon class="icon-small" name="logout" />
            </button>
        </div>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            state: app.state,
        }
    },
    methods: {
        disconnect() {
            app.disconnect()
        },
        toggleChatActive() {
            this.state.chat.active = !this.state.chat.active
        },
        toggleMute() {
            app.muteLocalTracks(this.state.muted)
        },
    },
}
</script>

<style lang="postcss">
.c-general-controls {
    background: var(--grey-400);
    border-left: var(--border) solid var(--grey-300);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>
