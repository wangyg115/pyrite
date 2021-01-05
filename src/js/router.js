import Login from '../components/Login.vue'
import Settings from '../components/Settings.vue'
import StreamView from '../components/StreamView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        component: Login,
        name: "login",
        path: "/",
    },
    {
        component: Settings,
        name: "settings",
        path: "/settings",
    },
    {
        component: StreamView,
        name: "group",
        path: "/group/:groupId",
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router