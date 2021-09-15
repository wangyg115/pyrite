<template>
    <section class="c-dashboard-groups tab-content active">
        <div class="table">
            <div class="header">
                <div>{{ $t('group name') }}</div>
                <div>{{ $t('description') }}</div>
                <div>{{ $t('public') }}</div>
            </div>

            <RouterLink
                v-for="(group, name) in $s.manager.groups" :key="name"
                class="row"
                :to="{name: 'dashboard-groups-group', params: {groupid: group.name}}"
            >
                <div class="default-fields">
                    <div>{{ group.name }}</div>
                    <div>{{ group.description }}</div>
                    <div>{{ group.public }}</div>
                </div>
            </RouterLink>
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
