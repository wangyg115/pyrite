<template>
    <section class="c-admin-groups">
        <div
            v-for="group of filteredGroups"
            :key="group.name"
            class="group item"
        >
            <Icon class="item-icon icon-small" :name="group.public ? 'Group' : 'GroupLocked'" />
            <RouterLink
                class="name"
                :class="{active: $route.params.groupId === group.name}"
                :to="{name: 'admin-groups-group', params: {groupId: group.name, tabId: 'misc'}}"
                @click="toggleSelection(group.name)"
            >
                {{ group.name }}
            </Routerlink>
        </div>
    </section>
</template>

<script>
export default {
    computed: {
        filteredGroups() {
            return this.$s.admin.groups.filter((g) => g.public).concat(this.$s.admin.groups.filter((g) => !g.public))
        },
    },
    data() {
        return {
            selected: null,
        }
    },
    methods: {
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
