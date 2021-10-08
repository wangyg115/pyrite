<template>
    <nav class="c-manager-controls">
        <RouterLink
            class="btn btn-menu tooltip"
            :class="{active: $route.name === 'manager-users'}"
            :data-tooltip="$t('Users')"
            :to="{name: 'manager-users'}"
        >
            <Icon class="icon-small" name="User" />
        </RouterLink>
        <RouterLink
            v-if="$s.manager.group"
            class="btn btn-menu tooltip"
            :class="{active: $route.name === 'manager-group'}"
            :data-tooltip="$t('Groups')"
            :to="{name: 'manager-group', params: {groupId: $s.manager.group.name, tabId: 'misc'}}"
        >
            <Icon class="icon-small" name="Group" />
        </RouterLink>
        <RouterLink
            v-else
            class="btn btn-menu tooltip"
            :class="{active: $route.name === 'manager-groups'}"
            :data-tooltip="$t('Groups')"
            :to="{name: 'manager-groups'}"
        >
            <Icon class="icon-small" name="Group" />
        </RouterLink>

        <RouterLink
            v-if="$s.manager.group"
            class="btn btn-menu tooltip" :class="{active: $route.name === 'manager-groups'}"
            :data-tooltip="$t('Groups')"
            :to="{name: 'manager-group-recordings', params: {groupId: $s.manager.group.name}}"
        >
            <Icon class="icon-small" name="Record" />
        </RouterLink>
        <button v-else class="btn btn-menu" disabled>
            <Icon class="icon-small" name="Record" />
        </button>
    </nav>
</template>

<script>
export default {
    computed: {
        groupRoute() {
            return {name: 'manager-group', params: {groupId: this.$s.manager.group.name, tabId: 'misc'}}
        },
    },
}
</script>

<style lang="scss">
.c-manager-controls {
    background: var(--grey-4);
    border-left: var(--border) solid var(--grey-4);
    display: flex;
    flex-direction: column;
}
</style>
