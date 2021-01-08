import './css/pyrite.css'
import App from './App.vue'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import FieldText from './components/ui/fields/FieldText.vue'
import Icon from './components/ui/icons/Icon.vue'
import nl from './locales/nl.json'
import Pyrite from './js/app.js'
import router from './js/router.js'

console.log(createI18n)


// const i18n = createI18n({
//     legacy: false,
//     locale: 'en',
//     messages: {
//         nl,
//     },
// })

globalThis.app = new Pyrite(router)
globalThis.vm = createApp(App)

globalThis.vm.component('Icon', Icon)
globalThis.vm.component('FieldText', FieldText)

globalThis.vm
    .use(router)
    // .use(i18n)
    .mount('#app')


