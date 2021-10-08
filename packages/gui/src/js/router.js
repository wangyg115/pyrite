import ManagerApp from '../components/Manager/App.vue'
import ManagerGroup from '../components/Manager/Group/Group.vue'
import ManagerLogin from '../components/Manager/Login.vue'
import ManagerRecordings from '../components/Manager/Recordings.vue'
import ManagerUser from '../components/Manager/User.vue'

import UserApp from '../components/User/App.vue'
import UserLogin from '../components/User/Login.vue'
import UserSettings from '../components/User/Settings/Settings.vue'
import UserSplash from '../components/User/Splash.vue'
import UserStreamView from '../components/User/StreamView.vue'
import {createRouter, createWebHistory} from 'vue-router'

export default function(app) {
    const routes = [
        {
            beforeEnter: () => {
                app.$s.manager.group = null
            },
            children: [
                {
                    component: ManagerLogin,
                    name: 'manager-login',
                    path: '/manager/login',
                },
                {
                    component: UserSplash,
                    name: 'manager-groups',
                    path: '/manager/groups',
                },
                {
                    component: ManagerGroup,
                    name: 'manager-group',
                    path: '/manager/groups/:groupId/:tabId',
                },
                {
                    component: ManagerRecordings,
                    name: 'manager-group-recordings',
                    path: '/manager/groups/:groupId/recordings',
                },
                {
                    component: UserSplash,
                    name: 'manager-users',
                    path: '/manager/users',
                },
                {
                    component: ManagerUser,
                    name: 'manager-user',
                    path: '/manager/users/:userId',
                },
            ],

            component: ManagerApp,
            name: 'manager',
            path: '/manager',
        },
        {
            children: [
                {
                    component: UserSplash,
                    name: 'splash',
                    path: '/',
                },
                {
                    component: UserSettings,
                    name: 'settings',
                    path: '/settings/:tabId',
                },
                {
                    name: 'main',
                    path: '/',
                    redirect: () => {
                        // Don't allow to route to the splash-screen while
                        // being connected to a group.
                        if (app.$s.group.connected) {
                            return {name: 'groups', params: {groupId: app.$s.group.name}}
                        } else {
                            return {name: 'splash'}
                        }
                    },
                },
                {
                    name: 'groups',
                    path: '/groups/:groupId',
                    redirect: () => {
                        if (!app.$s.group.connected) {
                            return {name: 'groupsDisconnected'}
                        }
                        return {name: 'groupsConnected'}
                    },
                },
                {
                    component: UserStreamView,
                    name: 'groupsConnected',
                    path: '/groups/:groupId',
                },
                {
                    component: UserLogin,
                    name: 'groupsDisconnected',
                    path: '/groups/:groupId/login',
                },
            ],
            component: UserApp,
            name: 'user',
            path: '/',
        },
    ]

    return createRouter({
        history: createWebHistory(),
        linkActiveClass: 'active',
        routes,
    })
}
