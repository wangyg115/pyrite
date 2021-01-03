<template>
    <div class="home">
        <h1 id="title" class="navbar-brand">
            Galène
        </h1>

        <form id="groupform">
            <label for="group">Group:</label>
            <input
                id="group" class="form-control form-control-inline"
                name="group"
                type="text"
            >
            <input class="btn btn-default btn-large" type="submit" value="Join"><br>
        </form>

        <div id="public-groups" class="groups">
            <h2>Public groups</h2>

            <table id="public-groups-table">
                <tr v-for="group of groups">
                    <td>
                        <router-link :to="{name: 'group', params: {groupId: group.name}}">
                            {{ group.name }}
                        </router-link>
                    </td>
                    <td>{{ group.clientCount }}</td>
                </tr>
            </table>
        </div>
    </div>
    <footer class="signature">
        <p>
            <a href="https://galene.org/">Galène</a> by <a href="https://www.irif.fr/~jch/" rel="author">Juliusz Chroboczek</a>
        </p>
    </footer>
</template>
<script>
export default {
    name: 'Main',
    data() {
        return {
            groups: []
        }
    },
    async mounted() {
        try {
        this.groups = await (await fetch('/public-groups.json')).json()
        } catch(e) {
            console.error(e)
        }
    }
}
</script>

<style lang="postcss">
.nogroups {
    display: none;
}

.navbar-brand {
    margin-bottom: 5rem;
}

.home {
    height: calc(100vh - 50px);
    padding: 1.875rem;
}

#public-groups-table tr a{
    font-weight: 700;
    margin-left: 0.9375rem;
}

a {
    color: #0058E4;
    text-decoration: none;
}

a:hover {
    color: #0A429C;
}

label {
    display: block;
}

@media only screen and (max-device-width: 768px) {

    .home {
        padding: 0.625rem;
    }

}

</style>