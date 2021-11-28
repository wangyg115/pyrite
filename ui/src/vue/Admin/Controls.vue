<template>
    <nav class="c-admin-controls">
        <ButtonGroup :active="$route.name.startsWith('admin-groups')">
            <RouterLink
                active-class="active-group"
                class="btn btn-menu tooltip"
                :class="{active: $route.name === 'admin-groups-settings'}"
                :data-tooltip="$t('Groups')"
                :to="groupRoute('admin-groups-settings')"
            >
                <Icon class="icon-small" name="Settings" />
            </RouterLink>
            <RouterLink
                active-class="active-group"
                class="btn btn-menu tooltip"
                :class="{active: $route.name === 'admin-groups-dashboard'}"
                :data-tooltip="$t('Dashboard')"
                :to="groupRoute('admin-groups-dashboard')"
            >
                <Icon class="icon-small" name="Dashboard" />
            </RouterLink>

            <RouterLink
                active-class="active-group"
                class="btn btn-menu tooltip" :class="{active: $route.name === 'admin-groups-recordings'}"
                :data-tooltip="$t('Group Recordings')"
                :to="groupRoute('admin-groups-recordings')"
            >
                <Icon class="icon-small" name="Record" />
            </RouterLink>
        </ButtonGroup>

        <RouterLink
            class="btn btn-menu tooltip"
            :class="{active: $route.name.startsWith('admin-users')}"
            :data-tooltip="$t('People')"
            :to="userRoute('admin-users-settings')"
        >
            <Icon class="icon-small" name="User" />
        </RouterLink>

        <button
            v-if="$s.admin.authenticated"
            class="btn btn-menu btn-logout tooltip"
            :data-tooltip="$t('log out')"
            @click="logout"
        >
            <Icon class="icon-small" name="Logout" />
        </button>
    </nav>
</template>

<script>
export default {
    methods: {
        groupRoute(name) {
            if (this.$s.admin.group) {
                return {name, params: {groupId: this.$s.admin.group._name, tabId: 'misc'}}
            } else {
                return {name, params: {tabId: 'misc'}}
            }
        },
        async logout() {
            const context = await app.api.get('/api/logout')
            Object.assign(this.$s.admin, context)
            app.router.push({name: 'admin-login'})
        },
        userRoute(name) {
            if (this.$s.admin.user) {
                return {name, params: {tabId: 'misc', userId: this.$s.admin.user.id}}
            } else {
                return {name: 'admin-users-settings'}
            }
        },
    },
}
</script>

<style lang="scss">
.c-admin-controls {
    background: var(--grey-4);
    display: flex;
    flex-direction: column;
}
</style>
