<template>
    <div v-if="$s.admin.user" class="c-manager-group content">
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
                :to="{name: 'manager-users-user', params: {userId, tabId: 'misc'}}"
            >
                <Icon class="icon-small" name="SettingsMisc" />
            </RouterLink>
        </ul>

        <div class="tabs-content">
            <TabMisc v-if="$route.params.tabId === 'misc'" />

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

export default defineComponent({
    async beforeMount() {
        this.userId = this.$router.currentRoute.value.params.userId
    },
    async beforeRouteUpdate(to) {
        this.userId = to.params.userId
    },
    components: {TabMisc},
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
        },
    },
    watch: {
        userId(userId) {
            this.loadUser(userId)
        },
    },
})
</script>
