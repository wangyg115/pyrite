<template>
    <section class="c-admin-users presence">
        <div v-for="user of $s.admin.users" :key="user.id" class="group item">
            <Icon class="item-icon icon-small" name="User" />
            <RouterLink
                class="name"
                :class="{active: parseInt($route.params.userId) === user.id}"
                :to="{name: 'admin-users-user', params: {userId: user.id, tabId: 'misc'}}"
                @click="toggleSelection(user.id)"
            >
                {{ user.name }}
            </Routerlink>
        </div>
    </section>
</template>

<script>
export default {
    data() {
        return {
            selected: null,
        }
    },
    methods: {
        async loadUsers() {
            const res = await fetch('/api/users')
            this.$s.admin.users = await res.json()
        },
        selectUser(user) {
            if (!user || this.selected === user.name) {
                this.selected = null
            } else {
                this.selected = user.name
            }
        },
        toggleSelection(userId) {
            // Current clicked user is selected already; deselect by navigating to admin-users
            if (this.$route.name === 'admin-users-user' && parseInt(this.$route.params.userId) === userId) {
                this.$router.push({name: 'admin-users'})
            }
        },
    },
    async mounted() {
        if (this.$s.admin.authenticated) {
            this.loadUsers()
        }
    },
    watch: {
        '$s.admin.authenticated': async function(authenticated) {
            if (authenticated) this.loadUsers()
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
