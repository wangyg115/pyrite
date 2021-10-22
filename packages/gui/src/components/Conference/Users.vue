<template>
    <section class="c-users presence">
        <div v-for="user of sortedUsers" :key="user.id" class="user item">
            <Icon
                v-if="user.status.raisehand"
                class="hand icon item-icon icon-small"
                name="Hand"
            />
            <Icon
                v-else class="item-icon icon-small"
                :class="classes(user)"
                name="User"
            />
            <div class="name">
                <template v-if="user.username">
                    {{ user.username }}
                </template>
                <template v-else>
                    '(anon)'
                </template>
                <span v-if="$s.users[0].id === user.id">
                    (you)
                </span>

                <div class="permissions">
                    <div class="status">
                        <Icon v-if="user.status.mic" class="icon icon-mini" name="Mic" />
                        <Icon v-else class="icon icon-mini error" name="MicMute" />
                    </div>

                    <span v-if="user.permissions.present" class="tooltip" :data-tooltip="$t('presenter role')">
                        <Icon class="icon icon-mini" name="Present" />
                    </span>
                    <span v-if="user.permissions.op" class="tooltip" :data-tooltip="$t('operator role')">
                        <Icon class="icon icon-mini" name="Operator" />
                    </span>
                </div>
            </div>

            <UserContext v-if="user.username !== 'RECORDING'" :user="user" />
        </div>
    </section>
</template>

<script>
import UserContext from './UserContext.vue'

export default {
    components: {UserContext},
    computed: {
        sortedUsers() {
            const users = [...this.$s.users]
            users.sort(function(a, b) {
                const aLowerName = a.username.toLowerCase()
                const bLowerName = b.username.toLowerCase()
                if(aLowerName < bLowerName) return -1
                else if(aLowerName > bLowerName) return +1
                else if(a.username < b.username) return -1
                else if(a.username > b.username) return +1
                return 0
            })
            return users
        },
    },
    methods: {
        classes(user) {
            const classes = {}
            if (!user.status.availability) return classes
            if (user.status.availability.id === 'away') {
                classes.away = true
            } else if (user.status.availability.id === 'busy') {
                classes.busy = true
            }
            return classes
        },
    },
}
</script>

<style lang="scss">
.user {
    font-family: var(--font-secondary);

    .item-icon {

        &.away {
            color: var(--grey-6);
        }

        &.busy {
            color: var(--error-color);
        }

        &.hand {
            animation-duration: 2.5s;
            animation-iteration-count: infinite;
            animation-name: wave-animation;
            transform-origin: center bottom;
        }

    }

    .name {
        align-items: center;
        display: flex;

        .permissions {
            align-items: center;
            display: flex;
            justify-content: center;
            margin-left: calc(var(--spacer) / 2);

            .status {
                margin-right: var(--spacer);
            }

            span {
                display: flex;
            }
        }
    }
}

</style>
