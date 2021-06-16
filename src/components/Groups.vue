<template>
    <section class="c-groups">
        <div class="group group-input item">
            <FieldText
                v-model="$s.group.name"
                class="custom-group"
                :help="$t('For unlisted groups')"
                name="group"
                placeholder="..."
                @focus="updateRoute"
            />
        </div>

        <div v-for="group of groups" :key="group.name" class="group item">
            <Icon class="item-icon icon-small" name="Groups" />
            <RouterLink class="name" :class="{active: $s.group.name === group.name}" :to="{name: 'groups', params: {groupId: group.name}}">
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
            if (this.$s.group.name) {
                // Update the group route when the user sets the group name.
                this.$router.replace({name: 'groups', params: {groupId: this.$s.group.name}})
            } else {
                // By default show the splash page when emptying the group input.
                this.$router.replace({name: 'splash'})
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
        /**
         * Note that the behaviour is that filling the custom group
         * input does NOT trigger the 'groupsDisconnected' view automatically,
         * while using the listed groups selection does. This is intended
         * behaviour, in order to keep the history clean.
         */
        '$s.group.name': {
            immediate: false,
            handler() {
                if (this.$router.currentRoute.value.name === 'groupsDisconnected') {
                    app.logger.debug(`updating group route: ${this.$s.group.name}`)
                    this.updateRoute()
                }
            },
        },
    },
}
</script>

<style lang="scss">
.c-groups {

    .group {

        .name {
            font-family: var(--font-secondary);
        }
    }

    .custom-group {
        padding-left: 0;
    }
}
</style>
