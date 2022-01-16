<template>
    <section class="c-groups presence">
        <RouterLink
            v-for="group of $s.groups"
            :key="group.name"
            class="group item"
            :class="{active: $s.group.name === group.name}"
            :to="groupLink(group.name)"
        >
            <Icon v-if="!group.locked" class="item-icon icon-small" name="Group" />
            <Icon v-else class="item-icon icon-small" name="GroupLocked" />

            <div class="name">
                {{ group.name }}
            </div>

            <div class="count" :class="{active: group.clientCount > 0}">
                {{ group.clientCount }}
                <Icon class="icon-small" name="User" />
            </div>
        </RouterLink>
        <div v-if="!$s.groups.length" class="group item no-public-groups">
            <Icon class="item-icon icon-small" name="Group" />
            <div class="name">
                {{ $t('no public groups') }}
            </div>
        </div>
        <div class="group group-input item">
            <FieldText
                v-model="$s.group.name"
                class="custom-group"
                :help="$t('use unlisted group')"
                name="group"
                placeholder="..."
                @focus="updateRoute"
            />
        </div>
    </section>
</template>

<script>
import app from '@/js/app.js'

export default {
    methods: {
        groupLink(groupId) {
            if (this.$s.group && this.$s.group.name === groupId) {
                return {name: 'conference-splash'}
            } else {
                return {name: 'conference-groups', params: {groupId}}
            }
        },
        async pollGroups() {
            this.$s.groups = await app.api.get('/public-groups.json')
            for (const group of this.$s.groups) {
                if (group.name === this.$s.group.name) {
                    if (group.locked) this.$s.group.locked = true
                    else this.$s.group.locked = false
                }
            }
        },
        updateRoute() {
            if (this.$s.group.name) {
                // Assume unlocked, when there are no public groups
                this.$s.group.locked = this.groups.find((i) => i.name === this.$s.group.name)?.locked || false

                // Update the group route when the user sets the group name.
                this.$router.replace({name: 'conference-groups', params: {groupId: this.$s.group.name}})
            } else {
                // By default show the splash page when emptying the group input.
                this.$router.replace({name: 'conference-splash'})
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
         * input does NOT trigger the 'user-groups-disconnected' view,
         * while using the listed groups selection does. This is
         * intended behaviour to keep the history clean.
         */
        '$s.group.name': {
            immediate: false,
            handler() {
                if (this.$router.currentRoute.value.name === 'user-groups-disconnected') {
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

        &.no-public-groups {

            .icon,
            .name {
                color: var(--grey-5);
            }
        }

        .count {
            align-items: center;
            display: flex;
            transition: all 0.25s ease-in;

            &.active {
                color: var(--grey-8);
            }
        }
    }

    .custom-group {
        padding-left: 0;
    }
}
</style>
