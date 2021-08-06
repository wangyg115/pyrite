<template>
    <section>
        <div v-for="user of sortedUsers" :key="user.id" class="user item">
            <Icon class="item-icon icon-small" name="User" />
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

                <div class="status">
                    <Icon v-if="user.status.raisehand" class="icon icon-mini" name="Hand" />
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
                const aLowerName = a.name.toLowerCase()
                const bLowerName = b.name.toLowerCase()
                if(aLowerName < bLowerName) return -1
                else if(aLowerName > bLowerName) return +1
                else if(a.name < b.name) return -1
                else if(a.name > b.name) return +1
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

        .status {
            color: var(--error-color);
        }
    }

}
</style>
