import { createApp } from 'vue'
import App from './App.vue'
import './index.css'


import Galene from './js/galene.js'

globalThis.app = new Galene()
createApp(App).mount('#app')

