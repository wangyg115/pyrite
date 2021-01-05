<template>
    <div class="c-groups presence-list">
        <h2>Public groups</h2>
        <div v-for="group of groups" :key="group.name" class="group item">
            <div class="name">
                <RouterLink :to="{name: 'group', params: {groupId: group.name}}">
                    {{ group.name }}
                </RouterLink>
            </div>
            <div class="count">
                {{ group.clientCount }}
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Groups',
    data() {
        return {
            groups: []
        }
    },
    async mounted() {
        try {
        this.groups = await (await fetch('/public-groups.json')).json()
        } catch(e) {
            console.error(e)
        }
    }
}
</script>

<style lang="postcss">
.c-groups {

}
</style>