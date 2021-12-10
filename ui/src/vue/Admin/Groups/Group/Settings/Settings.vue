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
                active-class="active-group"
                class="btn btn-menu tab tooltip"
                :class="{active: $route.name === 'admin-groups-settings'}"
                :data-tooltip="$t('group settings')"
                :to="groupRoute('admin-groups-settings')"
            >
                <Icon class="icon-small" name="Settings" />
            </RouterLink>

            <RouterLink
                active-class="active-group"
                class="btn btn-menu tooltip"
                :class="{active: $route.name === 'admin-groups-stats'}"
                :data-tooltip="$t('client statistics')"
                :to="groupRoute('admin-groups-stats')"
            >
                <Icon class="icon-small" name="Stats" />
            </RouterLink>

            <RouterLink
                active-class="active-group"
                class="btn btn-menu tooltip"
                :class="{active: $route.name === 'admin-groups-recordings'}"
                :data-tooltip="$t('Group Recordings')"
                :to="groupRoute('admin-groups-recordings')"
            >
                <Icon class="icon-small" name="Record" />
            </RouterLink>
        </ul>

        <div class="tabs-content">
            <Stats v-if="$route.name === 'admin-groups-stats'" :group-id="groupId" />
            <Recordings v-else-if="$route.name === 'admin-groups-recordings'" :group-id="groupId" />
            <TabMisc v-else-if="tabId === 'misc'" />
            <TabAccess v-else-if="tabId === 'access'" />
            <TabPermissions v-else-if="tabId === 'op'" category="op" />
            <TabPermissions v-else-if="tabId === 'presenter'" category="presenter" />
            <TabPermissions v-else-if="tabId === 'other'" category="other" />

            <div v-if="$route.name === 'admin-groups-settings'" class="actions">
                <RouterLink
                    active-class="active-group"
                    class="btn btn-menu tab tooltip"
                    :class="{active: tabId === 'misc'}"
                    :data-tooltip="$t('miscellaneous')"
                    :to="routeSettings('misc')"
                >
                    <Icon class="icon-small" name="SettingsMisc" />
                </RouterLink>
                <RouterLink
                    active-class="active-group"
                    class="btn btn-menu tab tooltip"
                    :class="{active: tabId === 'access'}"
                    :data-tooltip="$t('access')"
                    :to="routeSettings('access')"
                >
                    <Icon class="icon-small" name="Access" />
                </RouterLink>
                <RouterLink
                    active-class="active-group"
                    class="btn btn-menu tab tooltip"
                    :class="{active: tabId === 'op'}"
                    :data-tooltip="$t('operator permission')"
                    :to="routeSettings('op')"
                >
                    <Icon class="icon-small" name="Operator" />
                </RouterLink>
                <RouterLink
                    active-class="active-group"
                    class="btn btn-menu tab tooltip"
                    :class="{active: tabId === 'presenter'}"
                    :data-tooltip="$t('presenter permission')"
                    :to="routeSettings('presenter')"
                >
                    <Icon class="icon-small" name="Present" />
                </RouterLink>
                <RouterLink
                    active-class="active-group"
                    class="btn btn-menu tab tooltip"
                    :class="{active: tabId === 'other'}"
                    :data-tooltip="$t('passive permission')"
                    :to="routeSettings('other')"
                >
                    <Icon class="icon-small" name="OtherPermissions" />
                </RouterLink>
                <button
                    class="btn btn-menu tooltip tooltip-left warning"
                    :data-tooltip="$t('save group')"
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
import Recordings from '@/vue/Admin/Groups/Group/Recordings.vue'
import Stats from '@/vue/Admin/Groups/Group/Stats.vue'
import TabAccess from './TabAccess.vue'
import TabMisc from './TabMisc.vue'
import TabPermissions from './TabPermissions.vue'

export default defineComponent({
    components: {Recordings, Stats, TabAccess, TabMisc, TabPermissions},
    computed: {
        tabId() {
            return this.$route.query.tab || 'misc'
        },
    },
    methods: {
        groupRoute(name) {
            if (this.$s.admin.group) {
                return {name, params: {groupId: this.groupId, tabId: 'misc'}}
            } else {
                return {name, params: {tabId: 'misc'}}
            }
        },
        routeSettings(tabId) {
            return {
                params: {groupId: this.groupId},
                query: {tab: tabId},
                to: 'admin-groups-settings',
            }
        },
        async saveGroup() {
            const group = await this.$m.group.saveGroup(this.groupId, this.$s.admin.group)
            this.$router.push({name: 'admin-groups-settings', params: {groupId: group._name, tabId: this.$route.params.tabId}})
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
