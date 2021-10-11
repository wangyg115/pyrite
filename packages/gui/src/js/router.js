import AdminApp from '../components/Admin/App.vue'
import AdminGroup from '../components/Admin/Group/Group.vue'
import AdminLogin from '../components/Admin/Login.vue'
import AdminRecordings from '../components/Admin/Recordings.vue'
import AdminUser from '../components/Admin/User/User.vue'

import ConferenceApp from '../components/Conference/App.vue'
import ConferenceLogin from '../components/Conference/Login.vue'
import ConferenceSettings from '../components/Conference/Settings/Settings.vue'
import ConferenceStreamView from '../components/Conference/StreamView.vue'

import Splash from '../components/Splash.vue'

import {createRouter, createWebHistory} from 'vue-router'

export default function(app) {
    const routes = [
        {
            beforeEnter: () => {
                app.$s.admin.group = null
            },
            children: [
                {
                    component: AdminLogin,
                    name: 'admin-login',
                    path: '/admin/login',
                },
                {
                    component: Splash,
                    name: 'admin-groups',
                    path: '/admin/groups',
                },
                {
                    component: AdminGroup,
                    name: 'admin-groups-group',
                    path: '/admin/groups/:groupId/:tabId',
                },
                {
                    component: AdminRecordings,
                    name: 'admin-groups-group-recordings',
                    path: '/admin/groups/:groupId/recordings',
                },
                {
                    component: Splash,
                    name: 'admin-users',
                    path: '/admin/users',
                },
                {
                    component: AdminUser,
                    name: 'admin-users-user',
                    path: '/admin/users/:userId/:tabId',
                },
            ],

            component: AdminApp,
            name: 'admin',
            path: '/admin',
        },
        {
            children: [
                {
                    component: Splash,
                    name: 'conference-splash',
                    path: '/',
                },
                {
                    component: ConferenceSettings,
                    name: 'conference-settings',
                    path: '/settings/:tabId',
                },
                {
                    name: 'conference-main',
                    path: '/',
                    redirect: () => {
                        // Don't allow to route to the splash-screen while
                        // being connected to a group.
                        if (app.$s.group.connected) {
                            return {name: 'conference-groups', params: {groupId: app.$s.group.name}}
                        } else {
                            return {name: 'conference-splash'}
                        }
                    },
                },
                {
                    name: 'conference-groups',
                    path: '/groups/:groupId',
                    redirect: () => {
                        if (!app.$s.group.connected) {
                            return {name: 'conference-groups-disconnected'}
                        }
                        return {name: 'conference-groups-connected'}
                    },
                },
                {
                    component: ConferenceStreamView,
                    name: 'conference-groups-connected',
                    path: '/groups/:groupId',
                },
                {
                    component: ConferenceLogin,
                    name: 'conference-groups-disconnected',
                    path: '/groups/:groupId/login',
                },
            ],
            component: ConferenceApp,
            name: 'conference',
            path: '/',
        },
    ]

    return createRouter({
        history: createWebHistory(),
        linkActiveClass: 'active',
        routes,
    })
}
