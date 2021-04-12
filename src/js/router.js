import Settings from '../components/Settings/Settings.vue'
import Splash from '../components/Splash.vue'
import StreamView from '../components/StreamView.vue'
import {createRouter, createWebHistory} from 'vue-router'

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
            return {name: 'splash'}
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

const router = createRouter({
    history: createWebHistory(),
    linkActiveClass: 'active',
    routes,
})

export default router
