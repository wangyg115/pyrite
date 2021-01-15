<template>
    <div class="group item">
        <Icon class="item-icon icon-small" name="groups" />

        <FieldText
            v-model="customGroupId"
            autocomplete="username"
            name="username"
            placeholder="Join unlisted group"
            @focus="updateRoute"
        />
    </div>


    <div v-for="group of groups" :key="group.name" class="group item">
        <Icon class="item-icon icon-small" name="groups" />
        <RouterLink class="name" :to="{name: 'groups', params: {groupId: group.name}}">
            {{ group.name }}
        </RouterLink>
        <div class="count">
            {{ group.clientCount }}
        </div>
        <Icon class="icon-small" name="user" />
    </div>
</template>

<script>
export default {
    name: 'Groups',
    data() {
        return {
            customGroupId: '',
            groups: [],
            state: app.state,
        }
    },
    watch: {
        customGroupId() {
            this.updateRoute()
        }
    },

    async mounted() {
        this.intervalId = setInterval(this.pollGroups, 3000)
        this.pollGroups()
    },
    unmounted() {
        clearInterval(this.intervalId)
    },
    methods: {
        async pollGroups() {
            this.groups = await (await fetch('/public-groups.json')).json()
        },
        updateRoute() {
            if (this.customGroupId) {
                this.$router.replace({name: 'groups', params: {groupId: this.customGroupId}})
            } else {
                this.$router.replace({name: 'settings'})
            }
        }
    }
}
</script>

<style lang="postcss">
.c-groups {
    background: var(--grey-400);
}
</style>