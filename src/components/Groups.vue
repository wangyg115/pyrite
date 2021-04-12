<template>
    <section class="c-groups">
        <div class="group item">
            <FieldText
                v-model="$s.group"
                autocomplete="username"
                class="custom-group"
                :help="$t('custom input for unlisted groups')"
                name="username"
                placeholder="..."
                @focus="updateRoute"
            />
        </div>

        <div v-for="group of groups" :key="group.name" class="group item">
            <Icon class="item-icon icon-small" name="Groups" />
            <RouterLink class="name" :to="{name: 'groups', params: {groupId: group.name}}">
                {{ group.name }}
            </RouterLink>
            <div class="count">
                {{ group.clientCount }}
            </div>
            <Icon class="icon-small" name="User" />
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
    methods: {
        async pollGroups() {
            this.groups = await (await fetch('/public-groups.json')).json()
        },
        updateRoute() {
            if (this.$s.group) {
                this.$router.replace({name: 'groups', params: {groupId: this.$s.group}})
            } else {
                this.$router.replace({name: 'settings', params: {tabId: 'misc'}})
            }
        },
    },
    async mounted() {
        this.intervalId = setInterval(this.pollGroups, 3000)
        this.pollGroups()
    },
    unmounted() {
        clearInterval(this.intervalId)
    },
    watch: {
        '$s.group'() {
            this.updateRoute()
        },
    },
}
</script>

<style lang="postcss">
.c-groups {

    & .custom-group {
        padding-left: 0;
    }
}
</style>
