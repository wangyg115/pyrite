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
        </ul>

        <div class="tabs-content">
            <TabMisc v-if="tabId === 'misc'" />
            <TabAccess v-else-if="tabId === 'access'" />
            <TabPermissions v-else-if="tabId === 'op'" category="op" />
            <TabPermissions v-else-if="tabId === 'presenter'" category="presenter" />
            <TabPermissions v-else-if="tabId === 'other'" category="other" />

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
    computed: {
        tabId() {
            return this.$route.query.tab || 'misc'
        },
    },
    methods: {
        routeSettings(tabId) {
            return {
                params: {userId: this.$s.admin.group._name},
                query: {tab: tabId},
                to: 'admin-groups-settings',
            }
        },
        async saveGroup() {
            const groupId = this.$s.admin.group._name
            const group = await this.$m.group.saveGroup(groupId, this.$s.admin.group)
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
