import Login from '../components/Login.vue'
import Settings from '../components/Settings/Settings.vue'
import Splash from '../components/Splash.vue'
import StreamView from '../components/StreamView.vue'
import {createRouter, createWebHistory} from 'vue-router'

export default function(app) {
    const routes = [
        {
            component: Settings,
            name: 'settings',
            path: '/settings/:tabId',
        },
        {
            name: 'main',
            path: '/', 
            redirect: () => {
                if (app.state.connected) {
                    return {name: 'groups', params: {groupId: app.state.group}}
                } else {
                    return {name: 'splash'}
                }                
            },
        },
        {
            component: Splash,
            name: 'splash',
            path: '/',
        },
        
        {
            name: 'groups',
            path: '/groups/:groupId',
            redirect: () => {
                if (!app.state.connected) {
                    return {name: 'groupsDisconnected'}
                }
                return {name: 'groupsConnected'}
            },
        },
        {
            component: StreamView,
            name: 'groupsConnected',
            path: '/groups/:groupId',
        },
        {
            component: Login,
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
