<template>
    <section class="c-admin-groups presence">
        <div class="actions">
            <Icon class="item-icon icon-small" name="Plus" @click="addGroup" />
        </div>
        <div
            v-for="group of orderedGroups"
            :key="group._name"
            class="group item"
        >
            <Icon class="item-icon icon-small" :name="group.public ? 'Group' : 'GroupHidden'" />
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
        // List the non-public groups at the bottom, so the group list
        // at the upper side is the same as the public group list for users.
        orderedGroups() {
            return this.$s.admin.groups
                .filter((g) => g.public)
                // .concat(this.$s.admin.groups.filter((g) => !g.public))
        },
    },
    data() {
        return {
            selected: null,
        }
    },
    methods: {
        async addGroup() {
            // Load group template
            // $groupname is variabl
            const group = await (await fetch('/api/groups/template')).json()
            app.$s.admin.groups.push(group)
        },
        async loadGroups() {
            const res = await fetch('/api/groups')
            this.$s.admin.groups = await res.json()
        },
        toggleSelection(groupId) {
            // Current clicked user is selected already; deselect by navigating to admin-users
            if (this.$route.name === 'admin-groups-group' && this.$route.params.groupId === groupId) {
                this.$router.push({name: 'admin-groups'})
            }
        },
    },
    async mounted() {
        if (this.$s.admin.authenticated) {
            this.loadGroups()
        }
    },
    watch: {
        '$s.admin.authenticated': async function(authenticated) {
            if (authenticated) this.loadGroups()
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
