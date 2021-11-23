<template>
    <RouterView />
</template>

<script>
/**
 * This is a container component that handles keeping
 * track of the current user, so its child components
 * don't have to.
 */
export default {
    async beforeMount() {
        await this.loadUsers()
    },
    props: {
        userId: {
            default: () => null,
            type: String,
        },
    },
    methods: {
        async loadUser(userId) {
            const user = this.$s.admin.users.find((i) => i.id === userId)
            if (user && user._unsaved) {
                this.$s.admin.user = user
            } else {
                this.$s.admin.user = await app.api.get(`/api/users/${encodeURIComponent(userId)}`)
            }
        },
        async loadUsers() {
            this.$s.admin.users = await app.api.get('/api/users')
        },
    },
    watch: {
        userId(userId) {
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
