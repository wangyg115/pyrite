import './css/pyrite.css'
import App from './App.vue'
import { createApp } from 'vue'
import FieldText from './components/ui/fields/FieldText.vue'
import Icon from './components/ui/icons/Icon.vue'
import Pyrite from './js/app.js'
import router from './js/router.js'

globalThis.app = new Pyrite(router)
globalThis.vm = createApp(App)

globalThis.vm.component('Icon', Icon)
globalThis.vm.component('FieldText', FieldText)

globalThis.vm
    .use(router)
    .mount('#app')


