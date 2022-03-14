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
                :data-tooltip="$t('group settings')"
                :to="routeSettings('misc')"
            >
                <Icon class="icon-small" name="Pirate" />
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
                :class="{active: tabId === 'permissions'}"
                :data-tooltip="$t('permissions')"
                :to="routeSettings('permissions')"
            >
                <Icon class="icon-small" name="Operator" />
            </RouterLink>

            <RouterLink
                active-class="active-group"
                class="btn btn-menu tab tooltip"
                :class="{active: tabId === 'stats'}"
                :data-tooltip="$t('connection statistics')"
                :disabled="!$s.group._unsaved"
                :to="routeSettings('stats')"
            >
                <Icon class="icon-small" name="Stats" />
            </RouterLink>

            <RouterLink
                active-class="active-group"
                class="btn btn-menu tab tooltip"
                :class="{active: tabId === 'recordings'}"
                :data-tooltip="$t('group recordings')"
                :to="routeSettings('recordings')"
            >
                <Icon class="icon-small" name="Record" />
            </RouterLink>
        </ul>

        <div class="tabs-content">
            <TabMisc v-if="tabId === 'misc'" />
            <TabAccess v-else-if="tabId === 'access'" />
            <TabPermissions v-else-if="tabId === 'permissions'" />
            <Stats v-else-if="tabId === 'stats'" :group-id="groupId" />
            <Recordings v-else-if="tabId === 'recordings'" :group-id="groupId" />

            <div v-if="$route.name === 'admin-groups-settings'" class="actions">
                <button
                    class="btn btn-menu btn-save tooltip tooltip-left"
                    :data-tooltip="$t('store group')"
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
        routeSettings(tabId) {
            return {
                params: {groupId: this.groupId},
                query: {tab: tabId},
                to: 'admin-groups-settings',
            }
        },
        async saveGroup() {
            const group = await this.$m.group.saveGroup(this.groupId, this.$s.admin.group)
            this.$router.push({name: 'admin-groups-settings', params: {groupId: group._name}, query: this.$route.query})
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

<style lang="scss">
.btn-save {
    margin-bottom: var(--space-1);
}
</style>
