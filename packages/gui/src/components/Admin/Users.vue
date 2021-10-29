<template>
    <section class="c-admin-users presence">
        <div class="actions">
            <button class="btn">
                <Icon class="item-icon icon-small" name="Plus" @click="addUser" />
            </button>
            <button class="btn" :disabled="!$s.admin.user" @click="deleteUser">
                <Icon class="item-icon icon-small" name="Minus" />
            </button>
            <button
                class="btn tooltip tooltip-left"
                :data-tooltip="$t('save user to disk')"
                @click="saveUser"
            >
                <Icon class="icon-small" name="Save" />
            </button>
        </div>
        <div v-for="user of orderedUsers" :key="user.id" class="user item">
            <Icon class="item-icon icon-small" :class="{unsaved: user._unsaved}" name="User" />
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
    computed: {
        orderedUsers() {
            const users = this.$s.admin.users
                .filter((g) => g.admin).concat(this.$s.admin.users.filter((g) => !g.admin))
            return users.sort((a, b) => {
                if ( a.name < b.name) return -1
                if ( a.name > b.name) return 1
                return 0
            })
        },
    },
    data() {
        return {
            selected: null,
        }
    },
    methods: {
        async addUser() {
            const user = await (await fetch('/api/users/template')).json()
            this.$s.admin.users.push(user)
            this.toggleSelection(user.id)
        },
        async deleteUser() {
            this.$s.admin.users.splice(this.$s.admin.users.findIndex((i) => i.id === this.$s.admin.user.id), 1)
            if (!this.$s.admin.user._unsaved) {
                fetch(`/api/users/${app.$s.admin.user.id}/delete`)
            }

            if (this.orderedUsers.length) {
                this.toggleSelection(this.orderedUsers[0].id)
            }
        },
        async loadUsers() {
            this.$s.admin.users = await (await fetch('/api/users')).json()
        },
        async saveUser() {
            await this.$m.user.saveUser(this.$s.admin.user.id, this.$s.admin.user)
            // Select the next unsaved user, when this user was unsaved to allow rapid user creation.
            if (this.$s.admin.user._unsaved) {
                const nextUnsavedUserIndex = this.orderedUsers.findIndex((i) => i._unsaved)
                if (nextUnsavedUserIndex >= 0) {
                    this.toggleSelection(this.orderedUsers[nextUnsavedUserIndex].id)
                }
            }
        },
        toggleSelection(userId) {
            // Current clicked user is selected already; deselect by navigating to admin-users
            if (this.$route.name === 'admin-users-user' && parseInt(this.$route.params.userId) === userId) {
                this.$router.push({name: 'admin-users'})
            } else {
                this.$router.push({name: 'admin-users-user', params: {tabId: 'misc', userId}})
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
