import App from './App.vue'
import { createApp } from 'vue'

import router from "./js/router.js"
import './index.css'

import Galene from './js/galene.js'
globalThis.app = new Galene(router)

createApp(App).use(router).mount('#app')

