<template>
    <div v-if="$s.manager.authenticated" class="c-manager content">
        <ul class="tabs">
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('miscellaneous')"
                :to="{name: 'manager', params: {tabId: 'groups'}}"
            >
                <Icon class="icon-small" name="Group" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('devices')"
                :to="{name: 'manager', params: {tabId: 'recordings'}}"
            >
                <Icon class="icon-small" name="Record" />
            </RouterLink>
        </ul>

        <TabGroups v-if="$route.params.tabId === 'groups'" />
        <TabRecordings v-else-if="$route.params.tabId === 'recordings'" />
    </div>
    <ManagerLogin v-else />
</template>

<script>
import ManagerLogin from './ManagerLogin.vue'
import TabGroups from './TabGroups.vue'
import TabRecordings from './TabRecordings.vue'

export default {
    components: {ManagerLogin, TabGroups, TabRecordings},
    methods: {

    },
}
</script>

<style lang="scss">
.c-manager {

}

</style>
