<template>
    <nav class="c-general-controls">
        <div class="navigational-controls">
            <RouterLink
                class="btn btn-menu tooltip" :class="{active: $route.name === 'settings'}"
                :data-tooltip="$t('settings')"
                :to="{name: 'settings', params: {tabId: 'misc'}}"
            >
                <Icon class="icon-small" name="Settings" />
            </RouterLink>

            <RouterLink
                v-if="$s.group" class="btn btn-menu tooltip"
                :class="{active: ['groupsConnected', 'groupsDisconnected'].includes($route.name)}"
                :data-tooltip="$t('current group')"
                :to="{name: 'groups', params: {groupId: $s.group}}"
            >
                <Icon class="icon-small" name="Groups" />
            </RouterLink>
            <button v-else class="btn btn-menu" disabled>
                <Icon class="icon-small" name="Groups" />
            </button>

            <button
                v-if="$s.connected"
                class="btn btn-menu tooltip"
                :data-tooltip="$s.chat.active ? $t('hide chat') : $t('show chat')"
                @click="toggleChatActive"
            >
                <Icon class="icon-small" :name="$s.chat.active ? 'ChatClose' : 'Chat'" />
            </button>
            <button v-if="$s.connected" class="btn btn-menu no-feedback">
                <GeneralContext />
            </button>
            <button
                v-if="$s.connected"
                class="btn btn-menu btn-logout warning tooltip"
                :data-tooltip="$t('leave group')"
                @click="disconnect"
            >
                <Icon class="icon-small" name="Logout" />
            </button>
        </div>
    </nav>
</template>

<script>
import GeneralContext from './GeneralContext.vue'

export default {
    components: {GeneralContext},
    methods: {
        disconnect() {
            this.$s.group = ''
            app.disconnect()
            this.$router.push({name: 'splash'})
        },
        toggleChatActive() {
            this.$s.chat.active = !this.$s.chat.active
        },
        toggleMute() {
            app.muteLocalTracks(this.$s.muted)
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

    & .btn-logout {
        margin-top: var(--space-1);
    }
}
</style>
