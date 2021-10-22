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
                    :data-tooltip="$s.group.locked ? $t('join locked group') : $t('save group')"
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
            const res = await fetch(`/api/groups/${encodeURIComponent(groupId)}`)
            this.$s.admin.group = await res.json()
        },
        async saveGroup() {
            const groupId = this.$s.admin.group._name
            await fetch(`/api/groups/${encodeURIComponent(groupId)}`, {
                body: JSON.stringify(this.$s.admin.group),
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            })

            app.notifier.notify({level: 'info', message: this.$t('Group saved')})
        },
    },
    watch: {
        groupId(groupId) {
            this.loadGroup(groupId)
        },
    },
})
</script>
