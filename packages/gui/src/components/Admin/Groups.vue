<template>
    <section class="c-admin-groups presence">
        <div class="actions">
            <button class="btn">
                <Icon class="item-icon icon-small" name="Plus" @click="addGroup" />
            </button>
            <button
                class="btn tooltip tooltip-right"
                :data-tooltip="$t('mark for deletion')"
                :disabled="!$s.admin.group" @click="markDelete"
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
                :data-tooltip="$t('confirm deletion')"
                :disabled="!deletionGroups.length"
                @click="confirmDelete"
            >
                <Icon class="icon-small" name="Close" />
            </button>
        </div>
        <div
            v-for="group of orderedGroups"
            :key="group._name"
            class="group item"
        >
            <Icon v-if="group._delete" class="item-icon icon-small" name="Close" />
            <Icon
                v-else class="item-icon icon-small"
                :class="{unsaved: group._unsaved}"
                :name="group.public ? 'Group' : 'GroupHidden'"
            />
            <RouterLink
                class="name"
                :class="{active: $route.params.groupId === group._name}"
                :to="{name: 'admin-groups-group', params: {groupId: group._name, tabId: 'misc'}}"
                @click="toggleSelection(group._name)"
            >
                {{ group._name }}
            </Routerlink>
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
            const group = await (await fetch('/api/groups/template')).json()
            this.$s.admin.groups.push(group)
            this.toggleSelection(group._name)
        },
        async confirmDelete() {
            for (const group of this.deletionGroups) {
                this.$s.admin.groups.splice(this.$s.admin.groups.findIndex((i) => i._name === this.$s.admin.group._name), 1)
                if (!group._unsaved) {
                    await fetch(`/api/groups/${group._name}/delete`)
                }
            }

            if (this.orderedGroups.length) {
                this.toggleSelection(this.orderedGroups[0]._name)
            }
            app.notifier.notify(`deleted ${this.deletionGroups.length} groups`)
        },
        async loadGroups() {
            this.$s.admin.groups = await (await fetch('/api/groups')).json()
        },
        async markDelete() {
            this.$s.admin.group._delete = !this.$s.admin.group._delete
            for (let group of this.$s.admin.groups) {
                if (group._name == this.$s.admin.group._name) {
                    Object.assign(group, this.$s.admin.group)
                }
            }

            const cleanGroups = this.orderedGroups.filter((i) => !i._delete)
            if (cleanGroups.length) {
                this.toggleSelection(cleanGroups[0]._name)
            }
        },
        async saveGroup() {
            const groupId = this.$s.admin.group._name
            await this.$m.group.saveGroup(groupId, this.$s.admin.group)
            // Select the next unsaved group, when this group was unsaved
            // to allow rapid group creation.
            if (this.$s.admin.group._unsaved) {
                const nextGroupIndex = this.orderedGroups.findIndex((g) => g._unsaved)
                if (nextGroupIndex >= 0) {
                    this.toggleSelection(this.orderedGroups[nextGroupIndex]._name)
                }
            }
        },
        toggleSelection(groupId) {
            if (this.$route.name === 'admin-groups-group' && this.$route.params.groupId === groupId) {
                this.$s.admin.group = null
                this.$router.push({name: 'admin-groups'})
            } else {
                this.$router.push({name: 'admin-groups-group', params: {groupId: groupId, tabId: 'misc'}})
            }
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
