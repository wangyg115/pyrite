<template>
    <section class="c-groups-dashboard">
        <div v-for="group of $s.manager.groups" :key="group.name" class="group item">
            <Icon v-if="!group.locked" class="item-icon icon-small" name="Group" />
            <Icon v-else class="item-icon icon-small" name="GroupLocked" />
            <RouterLink
                class="name"
                :class="{active: $s.group.name === group.name}"
                :to="{name: 'manager-group', params: {groupId: group.name}}"
            >
                {{ group.name }}
            </Routerlink>
        </div>
    </section>
</template>

<script>
export default {
    computed: {
        selectedGroup() {
            for (const group of this.$s.manager.groups) {
                if (group.name === this.selected) {
                    return group
                }
            }
            return null
        },
    },
    data() {
        return {
            selected: null,
        }
    },
    methods: {
        selectGroup(group) {

            if (!group || this.selected === group.name) {
                this.selected = null
            } else {
                this.selected = group.name
            }
        },
    },
    async mounted() {
        const res = await fetch('/api/groups')
        this.$s.manager.groups = await res.json()
    },
}
</script>

<style lang="scss">

.c-dashboard-groups {

    .row {
        color: var(--grey-7);
    }
}
</style>
