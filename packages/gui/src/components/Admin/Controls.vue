<template>
    <nav class="c-admin-controls">
        <RouterLink
            v-if="$s.admin.user"
            class="btn btn-menu tooltip"
            :class="{active: $route.name.includes('admin-users')}"
            :data-tooltip="$t('Users')"
            :to="{name: 'admin-users-user', params: {userId: $s.admin.user.id, tabId: 'misc'}}"
        >
            <Icon class="icon-small" name="User" />
        </RouterLink>
        <RouterLink
            v-else
            class="btn btn-menu tooltip"
            :class="{active: $route.name === 'admin-users'}"
            :data-tooltip="$t('Users')"
            :to="{name: 'admin-users'}"
        >
            <Icon class="icon-small" name="User" />
        </RouterLink>

        <RouterLink
            v-if="$s.admin.group"
            class="btn btn-menu tooltip"
            :class="{active: $route.name === 'admin-groups-group'}"
            :data-tooltip="$t('Groups')"
            :to="{name: 'admin-groups-group', params: {groupId: $s.admin.group.name, tabId: 'misc'}}"
        >
            <Icon class="icon-small" name="Group" />
        </RouterLink>
        <RouterLink
            v-else
            class="btn btn-menu tooltip"
            :class="{active: $route.name === 'admin-groups'}"
            :data-tooltip="$t('Groups')"
            :to="{name: 'admin-groups'}"
        >
            <Icon class="icon-small" name="Group" />
        </RouterLink>

        <RouterLink
            v-if="$s.admin.group"
            class="btn btn-menu tooltip" :class="{active: $route.name === 'admin-groups'}"
            :data-tooltip="$t('Groups')"
            :to="{name: 'admin-groups-group-recordings', params: {groupId: $s.admin.group.name}}"
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

}
</script>

<style lang="scss">
.c-admin-controls {
    background: var(--grey-4);
    border-left: var(--border) solid var(--grey-4);
    display: flex;
    flex-direction: column;
}
</style>
