<template>
    <div v-if="$s.admin.user" class="c-admin-user content">
        <header>
            <div class="notice" />
            <div class="title">
                <span>{{ $s.admin.user.name }}</span>
                <Icon class="icon icon-regular" name="User" />
            </div>
        </header>

        <ul class="tabs">
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('miscellaneous')"
                :to="{name: 'admin-users-user', params: {userId, tabId: 'misc'}}"
            >
                <Icon class="icon-small" name="SettingsMisc" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('operator permission')"
                :to="{name: 'admin-users-user', params: {userId, tabId: 'op'}}"
            >
                <Icon class="icon-small" name="Operator" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('presenter permission')"
                :to="{name: 'admin-users-user', params: {userId, tabId: 'presenter'}}"
            >
                <Icon class="icon-small" name="Present" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('passive permission')"
                :to="{name: 'admin-users-user', params: {userId, tabId: 'other'}}"
            >
                <Icon class="icon-small" name="OtherPermissions" />
            </RouterLink>
        </ul>

        <div class="tabs-content">
            <TabMisc v-if="$route.params.tabId === 'misc'" />
            <TabPermissions v-if="$route.params.tabId === 'op'" category="op" />
            <TabPermissions v-if="$route.params.tabId === 'presenter'" category="presenter" />
            <TabPermissions v-if="$route.params.tabId === 'other'" category="other" />

            <div class="actions">
                <button
                    class="btn btn-menu tooltip tooltip-left"
                    :data-tooltip="$t('save user')"
                    @click="saveUser"
                >
                    <Icon class="icon-small" name="Save" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue'
import TabMisc from './TabMisc.vue'
import TabPermissions from './TabPermissions.vue'

export default defineComponent({
    async beforeMount() {
        this.userId = this.$router.currentRoute.value.params.userId
    },
    async beforeRouteUpdate(to) {
        this.userId = to.params.userId
    },
    components: {TabMisc, TabPermissions},
    data() {
        return {
            userId: null,
        }
    },
    methods: {
        async loadUser(userId) {
            const user = this.$s.admin.users.find((i) => i.id === userId)
            if (user && user._unsaved) {
                this.$s.admin.user = user
            } else {
                this.$s.admin.user = await (await fetch(`/api/users/${encodeURIComponent(userId)}`)).json()
            }
        },
        async saveUser() {
            await this.$m.user.saveUser(this.userId, this.$s.admin.user)
        },
    },
    watch: {
        userId(userId) {
            this.loadUser(userId)
        },
    },
})
</script>
