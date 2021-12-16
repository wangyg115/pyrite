<template>
    <section class="c-admin-users-list presence">
        <div class="actions">
            <button
                class="btn tooltip tooltip-right"
                :data-tooltip="$t('add new user')"
            >
                <Icon class="item-icon icon-small" name="Plus" @click="addUser" />
            </button>
            <button
                class="btn tooltip tooltip-right"
                :data-tooltip="$s.admin.user && $s.admin.user._delete ? $t('undo mark deletion') : $t('mark for deletion')"
                :disabled="!$s.admin.user" @click="toggleMarkDelete"
            >
                <Icon class="item-icon icon-small" name="Minus" />
            </button>
            <button
                class="btn tooltip tooltip-right"
                :data-tooltip="$t('store person')"
                @click="saveUser"
            >
                <Icon class="icon-small" name="Save" />
            </button>
            <button
                class="btn tooltip tooltip-right"
                :data-tooltip="`${$t('confirm deletion of {amount} users', {amount: deletionUsers.length})}`"
                :disabled="!deletionUsers.length"
                @click="deleteUsers"
            >
                <Icon class="icon-small" name="Trash" />
            </button>
        </div>
        <RouterLink
            v-for="user of orderedUsers"
            :key="user.id"
            class="user item"
            :class="{active: parseInt($route.params.userId) === user.id}" :to="userLink(user.id)"
        >
            <Icon v-if="user._delete" class="item-icon delete icon-small" name="Trash" />
            <Icon
                v-else class="item-icon icon-small"
                :class="{unsaved: user._unsaved}"
                name="User"
            />

            <div class="name">
                {{ user.name }}
            </div>
        </Routerlink>
    </section>
</template>

<script>
export default {
    computed: {
        deletionUsers() {
            return this.$s.admin.users.filter((i) => i._delete)
        },
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
            const user = await app.api.get('/api/users/template')
            this.$s.admin.users.push(user)
            this.toggleSelection(user.id)
        },
        async deleteUsers() {
            app.notifier.notify({level: 'info', message: `deleting ${this.deletionUsers.length} users`})
            const deleteRequests = []
            for (const user of this.deletionUsers) {
                this.$s.admin.users.splice(this.$s.admin.users.findIndex((i) => i.id === user.id), 1)
                if (!user._unsaved) {
                    deleteRequests.push(fetch(`/api/users/${user.id}/delete`))
                }
            }

            await Promise.all(deleteRequests)

            if (this.orderedUsers.length) {
                const userId = this.orderedUsers[0].id
                this.$router.push({name: 'admin-users-settings', params: {tabId: 'misc',userId}})
            }
        },
        async loadUsers() {
            this.$s.admin.users = await app.api.get('/api/users')
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
        async toggleMarkDelete() {
            this.$s.admin.user._delete = !this.$s.admin.user._delete
            for (let user of this.$s.admin.users) {
                if (user.name == this.$s.admin.user.name) {
                    user._delete = this.$s.admin.user._delete
                }
            }

            const similarStateUsers = this.orderedUsers.filter((i) => i._delete !== this.$s.admin.user._delete)
            if (similarStateUsers.length) {
                this.toggleSelection(similarStateUsers[0].id)
            }
        },
        toggleSelection(userId) {
            this.$router.push({name: this.$route.name, params: {userId}})
        },
        userLink(userId) {
            if (this.$s.admin.user && this.$s.admin.user.id == userId) {
                return {name: this.$route.name}
            } else {
                return {name: this.$route.name, params: {userId}}
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
.c-admin-users-list {

    .row {
        color: var(--grey-7);
    }
}
</style>
