<template>
    <nav class="c-dashboard-controls">
        <RouterLink
            class="btn btn-menu tooltip" :class="{active: $route.name === 'dashboard-groups'}"
            :data-tooltip="$t('Groups')"
            :to="{name: 'dashboard-groups'}"
        >
            <Icon class="icon-small" name="Group" />
        </RouterLink>
        <RouterLink
            class="btn btn-menu tooltip" :class="{active: $route.name === 'dashboard-groups'}"
            :data-tooltip="$t('Groups')"
            :to="{name: 'dashboard-recordings'}"
        >
            <Icon class="icon-small" name="Record" />
        </RouterLink>
    </nav>
</template>

<script>
export default {

}
</script>
