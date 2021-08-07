<template>
    <section>
        <div v-for="user of sortedUsers" :key="user.id" class="user item">
            <Icon
                v-if="user.status.raisehand"
                class="hand icon item-icon icon-small"
                name="Hand"
            />
            <Icon v-else class="item-icon icon-small" name="User" />
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
                    <span v-if="user.permissions.present" class="tooltip" :data-tooltip="$t('presenter role')">
                        <Icon class="icon icon-mini" name="Present" />
                    </span>
                    <span v-if="user.permissions.op" class="tooltip" :data-tooltip="$t('operator role')">
                        <Icon class="icon icon-mini" name="Operator" />
                    </span>
                </div>
            </div>

            <UserContext v-if="user.username !== 'RECORDING' && user.id !== $s.user.id" :user="user" />
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
}
</script>

<style lang="scss">
.user {
    font-family: var(--font-secondary);

    .hand {
        animation-duration: 2.5s;
        animation-iteration-count: infinite;
        animation-name: wave-animation;
    }

    .name {
        align-items: center;
        display: flex;

        .permissions {
            align-items: center;
            display: flex;
            justify-content: center;
            margin-left: var(--spacer);

            span {
                display: flex;
            }
        }
    }

}

@keyframes wave-animation {
    0% { transform: rotate(0.0deg); }
    10% { transform: rotate(14.0deg); }  /* The following five values can be played with to make the waving more or less extreme */
    20% { transform: rotate(-8.0deg); }
    30% { transform: rotate(14.0deg); }
    40% { transform: rotate(-4.0deg); }
    50% { transform: rotate(10.0deg); }
    60% { transform: rotate( 0.0deg); }  /* Reset for the last half to pause */
    100% { transform: rotate( 0.0deg); }
}
</style>
