<template>
    <section class="c-groups">
        <div class="group item">
            <Icon class="item-icon icon-small" name="groups" />

            <FieldText
                v-model="state.group"
                autocomplete="username"
                class="custom-group"
                name="username"
                placeholder="Join a group"
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
    </section>
</template>

<script>
export default {
    name: 'Groups',
    data() {
        return {
            groups: [],
            state: app.state,
        }
    },
    watch: {
        'state.group'() {
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
            if (this.state.group) {
                console.log('REPLACE GROUP', this.state.group)
                this.$router.replace({name: 'groups', params: {groupId: this.state.group}})
            } else {
                this.$router.replace({name: 'settings'})
            }
        }
    }
}
</script>

<style lang="postcss">
.c-groups {

    & .custom-group {
        padding-left: 0;
    }
}

</style>