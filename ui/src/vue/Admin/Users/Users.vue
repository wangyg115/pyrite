<template>
    <RouterView v-if="$s.admin.user" />
    <Splash v-else :instruction="$t('select a person')" />
</template>

<script>
import Splash from '@/vue/Elements/Splash.vue'
/**
 * This is a container component that handles keeping
 * track of the current user, so its child components
 * don't have to.
 */
export default {
    components: {Splash},
    async beforeMount() {
        await this.loadUsers()
        if (this.userId) {
            this.loadUser(this.userId)
        }
    },
    props: {
        userId: {
            default: () => null,
            type: String,
        },
    },
    methods: {
        async loadUser(userId) {
            this.app.logger.debug(`load user ${userId}`)
            const user = this.$s.admin.users.find((i) => i.id === userId)
            if (user && (user._unsaved || user._delete)) {
                this.$s.admin.user = user
            } else {
                this.$s.admin.user = await this.app.api.get(`/api/users/${encodeURIComponent(userId)}`)
            }
        },
        async loadUsers() {
            this.$s.admin.users = await this.app.api.get('/api/users')
        },
    },
    watch: {
        userId(userId) {
            if (!userId) {
                this.$s.admin.user = null
                return
            }
            this.loadUser(userId)
        },
    },
}
</script>

<style lang="scss">
.c-admin-groups {

    .row {
        color: var(--grey-7);
    }
}
</style>
