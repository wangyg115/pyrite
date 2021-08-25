<template>
    <section class="tab-content active">
        <div class="table">
            <div class="header">
                <div>GROUP NAME</div>
                <div>DESCRIPTION</div>
                <div>PUBLIC</div>
            </div>

            <div v-for="(group, name) in $s.manager.groups" :key="name" class="row">
                <div>{{ name }}</div>
                <div>{{ group.description }}</div>
                <div>{{ group.public }}</div>
                <!-- <div>{{ group.contact }}</div> -->
            <!-- <div>{{ group.public }}</div>
            <div>{{ group.op }}</div>
            <div>{{ group.presenter }}</div>
            <div>{{ group['max-clients'] }}</div> -->
            </div>
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
