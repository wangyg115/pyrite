<template>
    <section class="c-admin-recordings content">
        RECORDINGS
        {{ recordings }}
    </section>
</template>

<script>
export default {
    data() {
        return {
            recordings: [],
        }
    },
    methods: {
        async loadRecordings(groupId) {
            this.recordings = await app.api.get(`/api/recordings/${groupId}`)
        },
    },
    mounted() {
        if (this.$s.admin.group) {
            const groupId = this.$s.admin.group._name
            this.loadRecordings(groupId)
        }
    },
}
</script>
