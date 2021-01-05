<template>
    <div id="users">
        <div v-for="user of sortedUsers" :key="user.id" class="user-p">
            <template v-if="user.name">
                {{ user.name }}
            </template>
            <template v-else>
                '(anon)'
            </template>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            state: app.state
        }
    },
    computed: {
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
#users {
    background-color: #FFF;
    border: 1px solid #F7F7F7;
    display: block;
    height: calc(100% - 84px);
    margin: 0;
    overflow-y: auto;
    padding: 0;
    position: relative;
    width: 100%;
    z-index: 1;
}

#users .user-p {
    border-bottom: 1px solid #F0F0F0;
    cursor: pointer;
    height: 40px;
    line-height: 18px;
    margin: 0 !important;
    overflow: hidden;
    padding: 10px !important;
    position: relative;
    white-space: pre;
}

#users > div:hover {
    background-color: #F2F2F2;
}

#users > div::before {
    color: #20B91E;
    content: "\f111";
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    margin-right: 5px;
}
</style>