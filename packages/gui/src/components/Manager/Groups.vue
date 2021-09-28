<template>
    <section class="c-manager-groups">
        <div v-for="group of $s.manager.groups" :key="group.name" class="group item">
            <Icon class="item-icon icon-small" :name="group.public ? 'Group' : 'GroupLocked'" />
            <RouterLink
                class="name"
                :class="{active: $s.manager.group && $s.manager.group.name === group.name}"
                :to="{name: 'manager-group', params: {groupId: group.name, tabId: 'misc'}}"
            >
                {{ group.name }}
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
        async loadGroups() {
            const res = await fetch('/api/groups')
            this.$s.manager.groups = await res.json()
        },
        selectGroup(group) {

            if (!group || this.selected === group.name) {
                this.selected = null
            } else {
                this.selected = group.name
            }
        },
    },
    async mounted() {
        if (this.$s.manager.authenticated) {
            this.loadGroups()
        }
    },
    watch: {
        '$s.manager.authenticated': async function(authenticated) {
            if (authenticated) this.loadGroups()
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
