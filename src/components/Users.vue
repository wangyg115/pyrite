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
                <span v-if="state.users[0].id === user.id">
                    (you)
                </span>
            </div>
            <div v-if="state.users[0].id === user.id" class="me">
                <span class="tooltip" :data-tooltip="$t('presenter role')">
                    <Icon
                        v-if="state.permissions.present"
                        class="icon icon-mini"
                        name="Present"
                    />
                </span>
                <span class="tooltip" :data-tooltip="$t('operator role')">
                    <Icon v-if="state.permissions.op" class="icon icon-mini" name="Operator" />
                </span>
            </div>
            <UserContext />
        </div>
    </section>
</template>
<script>
import UserContext from './UserContext.vue'
export default {
    components: {UserContext},
    computed: {
        sortedUsers() {
            const users = [...this.state.users]
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

            if(app.state.permissions.op && app.state.permissions.present)
                text = '(op, presenter)'
            else if(app.state.permissions.op)
                text = 'operator'
            else if(app.state.permissions.present)
                text = 'presenter'

            return text
        },
    },
    data() {
        return {
            state: app.state,
        }
    },
}
</script>

<style lang="postcss">
.user {

    & .me {
        font-size: var(--text-small);
    }
}

</style>
