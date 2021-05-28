<template>
    <section>
        <div v-for="user of sortedUsers" :key="user.id" class="user item">
            <Icon class="item-icon icon-small" name="User" />
            <div class="name">
                <template v-if="user.name">
                    {{ user.name }}
                </template>
                <template v-else>
                    '(anon)'
                </template>
                <span v-if="$s.users[0].id === user.id">
                    (you)
                </span>
            </div>
            <div v-if="$s.users[0].id === user.id" class="me">
                <span class="tooltip" :data-tooltip="$t('presenter role')">
                    <Icon
                        v-if="$s.permissions.present"
                        class="icon icon-mini"
                        name="Present"
                    />
                </span>
                <span class="tooltip" :data-tooltip="$t('operator role')">
                    <Icon v-if="$s.permissions.op" class="icon icon-mini" name="Operator" />
                </span>
            </div>
            <UserContext :user="user" />
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
        userRights() {
            let text = ''

            if(app.$s.permissions.op && app.$s.permissions.present)
                text = '(op, presenter)'
            else if(app.$s.permissions.op)
                text = 'operator'
            else if(app.$s.permissions.present)
                text = 'presenter'

            return text
        },
    },
}
</script>

<style lang="postcss">
.user {
    font-family: var(--font-secondary);

    & .me {
        font-size: var(--text-small);
    }
}
</style>
