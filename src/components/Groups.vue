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
            <Icon v-if="!group.locked" class="item-icon icon-small" name="Groups" />
            <Icon v-else class="item-icon icon-small" name="Lock" />
            <RouterLink class="name" :class="{active: $s.group.name === group.name}" :to="{name: 'groups', params: {groupId: group.name}}">
                {{ group.name }}
            </RouterLink>

            <div class="count" :class="{active: group.clientCount > 0}">
                {{ group.clientCount }}
                <Icon class="icon-small" name="User" />
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
    methods: {
        async pollGroups() {
            this.groups = await (await fetch('/public-groups.json')).json()
            for (const group of this.groups) {
                if (group.name === this.$s.group.name) {
                    if (group.locked) this.$s.group.locked = true
                    else this.$s.group.locked = false
                }
            }
        },
        updateRoute() {
            if (this.$s.group.name) {
                this.$s.group.locked = this.groups.find((i) => i.name === this.$s.group.name).locked

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
         * Note that the behaviour is that using the custom group
         * input does NOT trigger the 'groupsDisconnected' view,
         * while using the listed groups selection does. This is
         * intended behaviour to keep the history clean.
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

        .count {
            align-items: center;
            display: flex;
            transition: all 0.25s ease-in;

            &.active {
                color: var(--grey-0);
            }
        }
    }

    .custom-group {
        padding-left: 0;
    }
}
</style>
