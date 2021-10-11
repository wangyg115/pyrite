<template>
    <section class="c-admin-group-tab-presenter tab-content active">
        <div
            v-for="group of $s.admin.groups"
            :key="group.name"
            class="group item"
        >
            <input v-model="$s.admin.user.groups.presenter" type="checkbox" :value="group.name">
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
