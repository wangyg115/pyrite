<template>
    <section v-if="$s.admin.authenticated" class="c-admin-groups presence">
        <div class="actions">
            <button class="btn">
                <Icon class="item-icon icon-small" name="Plus" @click="addGroup" />
            </button>
            <button
                class="btn tooltip tooltip-right"
                :data-tooltip="$t('(un)mark for deletion')"
                :disabled="!$s.admin.group" @click="toggleMarkDelete"
            >
                <Icon class="item-icon icon-small" name="Minus" />
            </button>
            <button
                class="btn tooltip tooltip-right"
                :data-tooltip="$t('store group')"
                :disabled="!$s.admin.group"
                @click="saveGroup"
            >
                <Icon class="icon-small" name="Save" />
            </button>
            <button
                class="btn tooltip tooltip-right"
                :data-tooltip="`${$t('confirm deletion of {amount} groups', {amount: deletionGroups.length})}`"
                :disabled="!deletionGroups.length"
                @click="deleteGroups"
            >
                <Icon class="icon-small" name="Trash" />
            </button>
        </div>
        <div
            v-for="group of orderedGroups"
            :key="group._name"
            class="group item"
        >
            <Icon v-if="group._delete" class="item-icon delete icon-small" name="Trash" />
            <Icon
                v-else class="item-icon icon-small"
                :class="{unsaved: group._unsaved}"
                name="Group"
            />

            <div class="flex-column">
                <RouterLink
                    class="name"
                    :class="{active: $route.params.groupId === group._name}"
                    :to="groupLink(group._name)"
                >
                    {{ group._name }}
                </Routerlink>
                <div class="item-properties">
                    <Icon
                        class="icon-tiny"
                        :name="group.public ? 'Eye' : 'EyeClosed'"
                    />
                    <Icon
                        class="icon-tiny"
                        :name="group.locked ? 'Lock' : 'Unlock'"
                    />
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    computed: {
        deletionGroups() {
            return this.$s.admin.groups.filter((i) => i._delete)
        },
        /**
         * List the non-public groups at the bottom, so the group list
         * at the upper side is the same as the public group list
         * for users.
         */
        orderedGroups() {
            const groups = this.$s.admin.groups
                .filter((g) => g.public).concat(this.$s.admin.groups.filter((g) => !g.public))
            return groups.sort((a, b) => {
                if ( a._name < b._name) return -1
                if ( a._name > b._name) return 1
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
        async addGroup() {
            const group = await app.api.get('/api/groups/template')
            this.$s.admin.groups.push(group)
            this.toggleSelection(group._name)
        },
        async deleteGroups() {
            app.notifier.notify({level: 'info', message: `deleting ${this.deletionGroups.length} groups`})
            const deleteRequests = []
            for (const group of this.deletionGroups) {
                this.$s.admin.groups.splice(this.$s.admin.groups.findIndex((i) => i._name === group._name), 1)
                if (!group._unsaved) {
                    deleteRequests.push(fetch(`/api/groups/${group._name}/delete`))
                }
            }

            await Promise.all(deleteRequests)

            if (this.orderedGroups.length) {
                const groupId = this.orderedGroups[0]._name
                this.$router.push({name: 'admin-groups-group-settings', params: {groupId, tabId: 'misc'}})
            }
        },
        // The group link depends on the context, e.g. whether a user
        // may currently be watching the recordings view or group setitings.
        groupLink(groupId) {
            return {name: this.$route.name, params: {groupId, tabId: 'misc'}}
        },
        async loadGroups() {
            this.$s.admin.groups = await app.api.get('/api/groups')
        },
        async saveGroup() {
            const groupId = this.$s.admin.group._name
            const group = await this.$m.group.saveGroup(groupId, this.$s.admin.group)

            // Select the next unsaved group to speed up group creation.
            if (this.$s.admin.group._unsaved) {
                const nextGroupIndex = this.orderedGroups.findIndex((g) => g._unsaved)
                if (nextGroupIndex >= 0) {
                    this.toggleSelection(this.orderedGroups[nextGroupIndex]._name)
                }
            } else {
                // Reload the group, which may have been renamed.
                this.$router.push({name: 'admin-groups-group-settings', params: {groupId: group._name, tabId: 'misc'}})
            }
        },
        async toggleMarkDelete() {
            this.$s.admin.group._delete = !this.$s.admin.group._delete
            for (let group of this.$s.admin.groups) {
                if (group._name == this.$s.admin.group._name) {
                    group._delete = this.$s.admin.group._delete
                }
            }

            const similarStateGroups = this.orderedGroups.filter((i) => i._delete !== this.$s.admin.group._delete)
            if (similarStateGroups.length) {
                this.toggleSelection(similarStateGroups[0]._name)
            }
        },
        toggleSelection(groupId) {
            if (this.$route.name === 'admin-groups-group-settings' && this.$route.params.groupId === groupId) {
                this.$s.admin.group = null
                this.$router.push({name: 'admin-groups'})
            } else {
                this.$router.push({name: this.$route.name, params: {groupId}})
            }
        },
    },
    unmounted() {
        this.$s.admin.group = null
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
