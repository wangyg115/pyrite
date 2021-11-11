import App from '@/vue/Admin/App.vue'
import GroupRecordings from '@/vue/Admin/Groups/Group/Recordings.vue'
import Groups from '@/vue/Admin/Groups/Groups.vue'
import GroupSettings from '@/vue/Admin/Groups/Group/Settings/Settings.vue'
import Login from '@/vue/Admin/Login.vue'
import Splash from '@/vue/Elements/Splash.vue'
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
                    component: Splash,
                    name: 'admin-groups-splash',
                    path: '/admin/groups/:groupId?',
                },
                {
                    component: GroupRecordings,
                    name: 'admin-groups-group-recordings',
                    path: '/admin/groups/:groupId?/recordings',
                    props: true,
                },
                {
                    component: GroupSettings,
                    name: 'admin-groups-group-settings',
                    path: '/admin/groups/:groupId?/settings/:tabId',
                    props: true,
                },
            ],
            component: Groups,
            name: 'admin-groups',
            path: '/admin/groups/:groupId?',
            props: true,
        },
        {
            children: [
                {
                    component: Splash,
                    name: 'admin-users-splash',
                    path: '/admin/users/:userId?',
                },
                {
                    component: UserSettings,
                    name: 'admin-users-user-settings',
                    path: '/admin/users/:userId?/:tabId',
                    props: true,
                },
            ],
            component: Users,
            name: 'admin-users',
            path: '/admin/users/:userId?',
            props: true,
        },
    ],
    component: App,
    name: 'admin',
    path: '/admin',
}]
