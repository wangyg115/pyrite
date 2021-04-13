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
            component: StreamView,
            name: 'groups',
            path: '/groups/:groupId',
        },
    ]
    
    return createRouter({
        history: createWebHistory(),
        linkActiveClass: 'active',
        routes,
    })
}
