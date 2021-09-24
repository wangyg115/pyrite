import ManagerApp from '../components/Manager/App.vue'
import ManagerGroup from '../components/Manager/Group.vue'
import ManagerRecordings from '../components/Manager/Recordings.vue'

import UserApp from '../components/User/App.vue'
import UserLogin from '../components/User/Login.vue'
import UserSettings from '../components/User/Settings/Settings.vue'
import UserSplash from '../components/User/Splash.vue'
import UserStreamView from '../components/User/StreamView.vue'
import {createRouter, createWebHistory} from 'vue-router'

export default function(app) {
    const routes = [
        {
            children: [
                {
                    component: UserSplash,
                    name: 'manager-groups',
                    path: '/groups',
                },
                {
                    component: ManagerGroup,
                    name: 'manager-group',
                    path: '/manager/groups/:groupId',
                },
                {
                    component: ManagerRecordings,
                    name: 'manager-recordings',
                    path: '/manager/recordings',
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

        // {
        //     component: UserSettings,
        //     name: 'settings',
        //     path: '/settings/:tabId',
        // },
        // {
        //     name: 'main',
        //     path: '/',
        //     redirect: () => {
        //         if (app.$s.group.connected) {
        //             return {name: 'groups', params: {groupId: app.$s.group.name}}
        //         } else {
        //             return {name: 'splash'}
        //         }
        //     },
        // },
        // {
        //     component: UserSplash,
        //     name: 'splash',
        //     path: '/',
        // },

        // {
        //     name: 'groups',
        //     path: '/groups/:groupId',
        //     redirect: () => {
        //         if (!app.$s.group.connected) {
        //             return {name: 'groupsDisconnected'}
        //         }
        //         return {name: 'groupsConnected'}
        //     },
        // },
        // {
        //     component: UserStreamView,
        //     name: 'groupsConnected',
        //     path: '/groups/:groupId',
        // },
        // {
        //     component: UserLogin,
        //     name: 'groupsDisconnected',
        //     path: '/groups/:groupId/login',
        // },
    ]

    return createRouter({
        history: createWebHistory(),
        linkActiveClass: 'active',
        routes,
    })
}
