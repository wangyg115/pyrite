import app from '@/js/app.js'

import App from '@/vue/Admin/App.vue'
import Groups from '@/vue/Admin/Groups/Groups.vue'
import GroupSettings from '@/vue/Admin/Groups/Group/Settings/Settings.vue'
import Login from '@/vue/Admin/Login.vue'
import Users from '@/vue/Admin/Users/Users.vue'
import UserSettings from '@/vue/Admin/Users/User/Settings/Settings.vue'

export default [{
    beforeEnter: () => {
        app.$s.admin.group = null
    },
    children: [
        {
            component: Login,
            name: 'admin-login',
            path: '/admin/login',
        },
        {
            children: [
                {
                    component: GroupSettings,
                    name: 'admin-groups-settings',
                    path: '/admin/groups/settings/:groupId?',
                    props: true,
                },
                {
                    component: GroupSettings,
                    name: 'admin-groups-stats',
                    path: '/admin/groups/stats/:groupId?',
                    props: true,
                },
                {
                    component: GroupSettings,
                    name: 'admin-groups-recordings',
                    path: '/admin/groups/recordings/:groupId?',
                    props: true,
                },
            ],
            component: Groups,
            name: 'admin-groups',
            path: '/admin/groups',
            props: true,
        },
        {
            children: [
                {
                    component: UserSettings,
                    name: 'admin-users-settings',
                    path: '/admin/users/settings/:userId?',
                    props: true,
                },
            ],
            component: Users,
            name: 'admin-users',
            path: '/admin/users',
            props: true,
        },
    ],
    component: App,
    name: 'admin',
    path: '/admin',
}]
