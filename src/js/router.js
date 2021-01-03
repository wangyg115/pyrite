import Group from '../components/Group.vue'
import Main from '../components/Main.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        component: Main,
        name: "main",
        path: "/",
    },
    {
        component: Group,
        name: "group",
        path: "/group/:groupId",
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router