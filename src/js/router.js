
import Settings from '../components/Settings.vue'
import StreamView from '../components/StreamView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        component: Settings,
        name: "settings",
        path: "/",
    },
    {
        component: StreamView,
        name: "groups",
        path: "/groups/:groupId",
    },
]

const router = createRouter({
    history: createWebHistory(),
    linkActiveClass: 'active',
    routes,
})

export default router