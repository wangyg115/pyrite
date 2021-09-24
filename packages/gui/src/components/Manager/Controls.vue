<template>
    <nav class="c-manager-controls">
        <RouterLink
            v-if="$s.group.name"
            class="btn btn-menu tooltip"
            :data-tooltip="$t('Groups')"
            :to="{name: 'manager-group', params: {groupId: $s.group.name}}"
        >
            <Icon class="icon-small" name="Group" />
        </RouterLink>
        <button v-else class="btn btn-menu" disabled>
            <Icon class="icon-small" name="Group" />
        </button>
        <RouterLink
            class="btn btn-menu tooltip" :class="{active: $route.name === 'manager-groups'}"
            :data-tooltip="$t('Groups')"
            :to="{name: 'manager-recordings'}"
        >
            <Icon class="icon-small" name="Record" />
        </RouterLink>
    </nav>
</template>

<script>
export default {

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
