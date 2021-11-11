<template>
    <RouterView />
</template>

<script>
/**
 * This is a container component that handles keeping
 * track of the current group, so its child components
 * don't have to.
 */
export default {
    async beforeMount() {
        if (this.groupId) {
            this.loadGroup(this.groupId)
        }
    },
    props: {
        groupId: {
            default: () => null,
            required: false,
            type: String,
        },
    },
    methods: {
        async loadGroup(groupId) {
            app.logger.debug(`load group ${groupId}`)
            let group = this.$s.admin.groups.find((i) => i._name === groupId)
            if (group && group._unsaved) {
                this.$s.admin.group = group
            } else {
                const apiGroup = await app.api.get(`/api/groups/${encodeURIComponent(groupId)}`)
                if (group) {
                    // Don't update internal state properties.
                    for (const key of Object.keys(group)) {
                        if (!key.startsWith('_')) group[key] = apiGroup[key]
                    }
                } else {
                    group = apiGroup
                }

            }
            this.$s.admin.group = group
        },
    },
    watch: {
        groupId(groupId) {
            this.loadGroup(groupId)
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
