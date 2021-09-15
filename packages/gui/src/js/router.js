import ManagerApp from '../components/Manager/App.vue'
import ManagerGroup from '../components/Manager/Group.vue'
import ManagerGroups from '../components/Manager/Groups.vue'
import ManagerRecordings from '../components/Manager/Recordings.vue'

import UserLogin from '../components/User/Login.vue'
import UserSettings from '../components/User/Settings/Settings.vue'
import UserSplash from '../components/User/Splash.vue'
import UserStreamView from '../components/User/StreamView.vue'
import {createRouter, createWebHistory} from 'vue-router'

export default function(app) {
    const routes = [
        {
            component: ManagerGroups,
            name: 'dashboard-groups',
            path: '/manager/groups',
        },
        {
            component: ManagerGroup,
            name: 'dashboard-groups-group',
            path: '/manager/groups/:groupid',
        },
        {
            component: ManagerRecordings,
            name: 'dashboard-recordings',
            path: '/manager/recordings',
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
            component: UserSplash,
            name: 'splash',
            path: '/',
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
    ]

    return createRouter({
        history: createWebHistory(),
        linkActiveClass: 'active',
        routes,
    })
}
