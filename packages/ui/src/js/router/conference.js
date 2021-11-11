import App from '@/vue/Conference/App.vue'
import Login from '@/vue/Conference/Groups/Group/Login.vue'
import Settings from '@/vue/Conference/Settings/Settings.vue'
import Splash from '@/vue/Elements/Splash.vue'
import Streams from '@/vue/Conference/Groups/Group/Group.vue'

export default [{
    children: [
        {
            component: Splash,
            name: 'conference-splash',
            path: '/',
        },
        {
            component: Settings,
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
            component: Streams,
            name: 'conference-groups-connected',
            path: '/groups/:groupId',
        },
        {
            component: Login,
            name: 'conference-groups-disconnected',
            path: '/groups/:groupId/login',
        },
    ],
    component: App,
    name: 'conference',
    path: '/',
}]
