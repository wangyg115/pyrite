<template>
    <section class="tab-content active">
        <div v-for="(group, name) in $s.manager.groups" :key="name">
            {{ name }}
            {{ group.contact }}
            {{ group.description }}
            {{ group.public }}
            {{ group.op }}
            {{ group.presenter }}
            {{ group['max-clients'] }}
        </div>
    </section>
</template>

<script>
export default {
    data() {
        return {
            groups: [],
        }
    },
    async mounted() {
        const res = await fetch('/api/groups')
        this.$s.manager.groups = await res.json()
    },
}
</script>
