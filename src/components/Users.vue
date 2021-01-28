<template>
    <section>
        <div v-for="user of sortedUsers" :key="user.id" class="user item">
            <Icon class="item-icon icon-small" name="user" />
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
                {{ userRights }}
            </div>
        </div>
    </section>
</template>
<script>
export default {
    data() {
        return {
            state: app.state
        }
    },
    computed: {
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
        sortedUsers() {
            const users = [...this.state.users]
            users.sort(function (a, b) {
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
    }
}
</script>

<style lang="postcss">
.user {

    & .me {
        font-size: var(--text-small);
    }
}

</style>