<template>
    <div v-if="$s.manager.authenticated" class="c-dashboard content">
        <header>
            <Icon class="item-icon icon-small" name="Dashboard" />Dashboard
        </header>
        <ul class="tabs">
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('miscellaneous')"
                :to="{name: 'dashboard', params: {tabId: 'groups'}}"
            >
                <Icon class="icon-small" name="Group" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('devices')"
                :to="{name: 'dashboard', params: {tabId: 'recordings'}}"
            >
                <Icon class="icon-small" name="Record" />
            </RouterLink>
        </ul>

        <TabGroups v-if="$route.params.tabId === 'groups'" />
        <TabRecordings v-else-if="$route.params.tabId === 'recordings'" />
    </div>
    <DashboardLogin v-else />
</template>

<script>
import DashboardLogin from './Login.vue'
import TabGroups from './TabGroups.vue'
import TabRecordings from './TabRecordings.vue'

export default {
    components: {DashboardLogin, TabGroups, TabRecordings},
    methods: {

    },
}
</script>

<style lang="scss">
.c-manager {

}

</style>
