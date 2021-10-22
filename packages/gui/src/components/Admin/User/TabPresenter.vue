<template>
    <section class="c-admin-group-tab-presenter tab-content active">
        <div
            v-for="groupName of Object.keys($s.admin.groups)"
            :key="groupName"
            class="group item"
        >
            <input v-model="$s.admin.user.groups.presenter" type="checkbox" :value="groupName">
            <RouterLink
                class="name"
                :class="{active: $route.params.groupId === groupName}"
                :to="{name: 'admin-groups-group', params: {groupId: groupName, tabId: 'misc'}}"
                @click="toggleSelection(groupName)"
            >
                {{ groupName }}
            </Routerlink>
        </div>
    </section>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    methods: {
        async loadGroups() {
            const res = await fetch('/api/groups')
            this.$s.admin.groups = await res.json()
        },
    },
    async mounted() {
        if (this.$s.admin.authenticated) {
            this.loadGroups()
        }
    },
})
</script>

<style lang="scss">
.c-admin-group-tab-presenter {

    .group {
        padding: var(--spacer) 0;

        input {
            margin-right: var(--space-1);
        }
    }
}
</style>
