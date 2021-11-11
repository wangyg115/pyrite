import adminRoutes from './admin.js'
import conferenceRoutes from './conference.js'
import {createRouter, createWebHistory} from 'vue-router'

export default function() {
    const routes = [...adminRoutes, ...conferenceRoutes]

    return createRouter({
        history: createWebHistory(),
        linkActiveClass: 'active',
        routes,
    })
}
