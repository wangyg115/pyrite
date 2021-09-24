<template>
    <nav class="c-manager-controls">
        <RouterLink
            class="btn btn-menu tooltip" :class="{active: $route.name === 'manager-groups'}"
            :data-tooltip="$t('Groups')"
            :to="{name: 'manager-groups'}"
        >
            <Icon class="icon-small" name="Group" />
        </RouterLink>
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
