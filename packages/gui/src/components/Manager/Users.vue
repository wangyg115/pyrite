<template>
    <section class="c-manager-users">
        <div v-for="user of $s.manager.users" :key="user.name" class="group item">
            <Icon class="item-icon icon-small" name="User" />
            <RouterLink
                class="name"
                :class="{active: $s.manager.user && $s.manager.user.name === user.name}"
                :to="{name: 'manager-user', params: {userId: user.name, tabId: 'misc'}}"
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
            this.$s.manager.users = await res.json()
        },
        selectUser(user) {
            if (!user || this.selected === user.name) {
                this.selected = null
            } else {
                this.selected = user.name
            }
        },
    },
    async mounted() {
        if (this.$s.manager.authenticated) {
            this.loadUsers()
        }
    },
    watch: {
        '$s.manager.authenticated': async function(authenticated) {
            if (authenticated) this.loadUsers()
        },
    },
}
</script>

<style lang="scss">

.c-manager-groups {

    .row {
        color: var(--grey-7);
    }
}
</style>
