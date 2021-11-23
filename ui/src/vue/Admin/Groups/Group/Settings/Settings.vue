<template>
    <div class="c-admin-group content">
        <header>
            <div class="notice" />
            <div class="title">
                <span v-if="$s.admin.group">{{ $s.admin.group._name }}</span>
                <Icon class="icon icon-regular" name="Group" />
            </div>
        </header>

        <ul class="tabs">
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('miscellaneous')"
                :to="{name: routeSettings, params: {groupId: groupId, tabId: 'misc'}}"
            >
                <Icon class="icon-small" name="SettingsMisc" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('access')"
                :to="{name: routeSettings, params: {groupId: groupId, tabId: 'access'}}"
            >
                <Icon class="icon-small" name="Access" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('operator permission')"
                :to="{name: routeSettings, params: {groupId: groupId, tabId: 'op'}}"
            >
                <Icon class="icon-small" name="Operator" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('presenter permission')"
                :to="{name: routeSettings, params: {groupId: groupId, tabId: 'presenter'}}"
            >
                <Icon class="icon-small" name="Present" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('passive permission')"
                :to="{name: routeSettings, params: {groupId: groupId, tabId: 'other'}}"
            >
                <Icon class="icon-small" name="OtherPermissions" />
            </RouterLink>
        </ul>

        <div class="tabs-content">
            <TabMisc v-if="$route.params.tabId === 'misc'" />
            <TabAccess v-else-if="$route.params.tabId === 'access'" />
            <TabPermissions v-if="$route.params.tabId === 'op'" category="op" />
            <TabPermissions v-if="$route.params.tabId === 'presenter'" category="presenter" />
            <TabPermissions v-if="$route.params.tabId === 'other'" category="other" />

            <div class="actions">
                <button
                    class="btn btn-menu tooltip tooltip-left"
                    :data-tooltip="$t('save user')"
                    @click="saveGroup"
                >
                    <Icon class="icon-small" name="Save" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue'
import TabAccess from './TabAccess.vue'
import TabMisc from './TabMisc.vue'
import TabPermissions from './TabPermissions.vue'

export default defineComponent({
    components: {TabAccess, TabMisc, TabPermissions},
    data() {
        return {
            routeSettings: 'admin-groups-group-settings',
        }
    },
    methods: {
        async saveGroup() {
            const groupId = this.$s.admin.group._name
            const group = await this.$m.group.saveGroup(groupId, this.$s.admin.group)
            this.$router.push({name: 'admin-groups-group-settings', params: {groupId: group._name, tabId: this.$route.params.tabId}})
        },
    },
    props: {
        groupId: {
            default: () => null,
            required: false,
            type: String,
        },
    },
})
</script>
