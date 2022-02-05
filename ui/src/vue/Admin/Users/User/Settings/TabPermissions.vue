<template>
    <section class="c-admin-group-tab-op tab-content active">
        <div
            v-for="group of $s.admin.groups"
            :key="group._name"
            class="group item"
        >
            <input v-model="$s.admin.user.groups[category]" type="checkbox" :value="group._name">
            {{ group._name }}
        </div>
    </section>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    methods: {
        async loadGroups() {
            this.$s.admin.groups = await this.app.api.get('/api/groups')
        },
    },
    async mounted() {
        if (this.$s.admin.authenticated) {
            this.loadGroups()
        }
    },
    props: {
        category: {
            required: true,
            type: String,
        },
    },
})
</script>

<style lang="scss">
.c-admin-group-tab-op {

    .group {
        padding: var(--spacer) 0;

        input {
            margin-right: var(--space-1);
        }
    }
}
</style>
