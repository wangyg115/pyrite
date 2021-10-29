<template>
    <div v-if="$s.admin.group" class="c-admin-group content">
        <header>
            <div class="notice" />
            <div class="title">
                <span>{{ $s.admin.group._name }}</span>
                <Icon class="icon icon-regular" name="Group" />
            </div>
        </header>

        <ul class="tabs">
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('miscellaneous')"
                :to="{name: 'admin-groups-group', params: {groupId: $s.admin.group._name, tabId: 'misc'}}"
            >
                <Icon class="icon-small" name="SettingsMisc" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('access')"
                :to="{name: 'admin-groups-group', params: {groupId: $s.admin.group._name, tabId: 'access'}}"
            >
                <Icon class="icon-small" name="Access" />
            </RouterLink>
        </ul>

        <div class="tabs-content">
            <TabMisc v-if="$route.params.tabId === 'misc'" />
            <TabAccess v-else-if="$route.params.tabId === 'access'" />

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

export default defineComponent({
    async beforeMount() {
        this.groupId = this.$router.currentRoute.value.params.groupId
    },
    async beforeRouteUpdate(to) {
        this.groupId = to.params.groupId
    },
    components: {TabAccess, TabMisc},
    data() {
        return {
            groupId: null,
        }
    },
    methods: {
        async loadGroup(groupId) {
            const group = this.$s.admin.groups.find((i) => i._name === groupId)
            if (group && group._unsaved) {
                this.$s.admin.group = group
            } else {
                this.$s.admin.group = await (await fetch(`/api/groups/${encodeURIComponent(groupId)}`)).json()
            }
        },
        async saveGroup() {
            const groupId = this.$s.admin.group._name
            await this.$m.group.saveGroup(groupId, this.$s.admin.group)
        },
    },
    watch: {
        groupId(groupId) {
            this.loadGroup(groupId)
        },
    },
})
</script>
