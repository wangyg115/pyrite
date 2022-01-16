<template>
    <section class="c-admin-group-tab-op tab-content active">
        <div
            v-for="user of $s.admin.users"
            :key="user.name"
            class="group item"
        >
            <input v-model="$s.admin.group[category]" type="checkbox" :value="user.name">
            {{ user.name }}
        </div>
    </section>
</template>

<script>
import app from '@/js/app.js'
import {defineComponent} from 'vue'

export default defineComponent({
    methods: {
        async loadGroups() {
            this.$s.admin.groups = await app.api.get('/api/groups')
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
