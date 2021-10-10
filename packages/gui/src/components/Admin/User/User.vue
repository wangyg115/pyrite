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
            <TabOp v-if="$route.params.tabId === 'op'" />
            <TabPresenter v-if="$route.params.tabId === 'presenter'" />
            <TabOther v-if="$route.params.tabId === 'other'" />

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
import TabOp from './TabOp.vue'
import TabOther from './TabOther.vue'
import TabPresenter from './TabPresenter.vue'

export default defineComponent({
    async beforeMount() {
        this.userId = this.$router.currentRoute.value.params.userId
    },
    async beforeRouteUpdate(to) {
        this.userId = to.params.userId
    },
    components: {TabMisc, TabOp, TabOther, TabPresenter},
    data() {
        return {
            userId: null,
        }
    },
    methods: {
        async loadUser(userId) {
            const res = await fetch(`/api/users/${encodeURIComponent(userId)}`)
            this.$s.admin.user = await res.json()
        },
        async saveUser() {
            await fetch(`/api/users/${this.userId}`, {
                body: JSON.stringify(this.$s.admin.user),
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            })
            app.notifier.notify({level: 'info', message: this.$t('User saved')})
        },
    },
    watch: {
        userId(userId) {
            this.loadUser(userId)
        },
    },
})
</script>
