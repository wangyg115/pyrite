<template>
    <nav class="c-general-controls">
        <div class="navigational-controls">
            <RouterLink
                class="btn btn-menu tooltip"
                :class="{active: $route.name === 'conference-settings'}"
                :data-tooltip="$t('settings')"
                :to="{name: 'conference-settings', params: {tabId: 'misc'}}"
            >
                <Icon class="icon-small" name="Settings" />
            </RouterLink>

            <RouterLink
                v-if="$s.group.name" class="btn btn-menu tooltip"
                :class="{
                    active: ['conference-groups-connected', 'conference-groups-disconnected'].includes($route.name)
                }"
                :data-tooltip="$s.group.locked ? `${$t('current group')} (${$t('locked')})` : $t('current group')"
                :to="{name: 'conference-groups', params: {groupId: $s.group.name}}"
            >
                <Icon v-if="!$s.group.locked" class="icon-small" name="Group" />
                <Icon v-else class="icon-small" name="GroupLocked" />
            </RouterLink>

            <button v-else class="btn btn-menu" disabled>
                <Icon class="icon-small" name="Group" />
            </button>

            <button
                v-if="$s.group.connected"
                class="btn btn-menu tooltip mb-1"
                :class="{active: !$s.chat.hidden}"
                :data-tooltip="$s.chat.hidden ? $t('show chat') : $t('hide chat')"
                @click="$s.chat.hidden = !$s.chat.hidden"
            >
                <Icon class="icon-small" name="Chat" />
            </button>

            <Context v-if="$s.group.connected && $s.permissions.op" />

            <button
                v-if="$s.group.connected"
                class="btn btn-menu btn-logout tooltip"
                :data-tooltip="$t('leave group')"
                @click="$m.sfu.disconnect"
            >
                <Icon class="icon-small" name="Logout" />
            </button>
        </div>
    </nav>
</template>

<script>
import Context from './Context.vue'

export default {
    components: {Context},
}
</script>

<style lang="scss">
.c-general-controls {
    background: var(--grey-4);
    border-left: var(--border) solid var(--grey-4);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>
