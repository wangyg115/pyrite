import '@/js/lib/helpers.js'
import '@/scss/app.scss'

import App from '@/vue/Elements/App.vue'

import ButtonGroup from '@/vue/Elements/ButtonGroup.vue'
import ContextInput from '@/vue/Elements/Context/ContextInput.vue'
import ContextSelect from '@/vue/Elements/Context/ContextSelect.vue'
import {createApp} from 'vue'
import FieldCheckbox from '@/vue/Elements/Field/FieldCheckbox.vue'
import FieldFile from '@/vue/Elements/Field/FieldFile.vue'
import FieldSelect from '@/vue/Elements/Field/FieldSelect.vue'
import FieldSlider from '@/vue/Elements/Field/FieldSlider.vue'
import FieldText from '@/vue/Elements/Field/FieldText.vue'
import Hint from '@/vue/Elements/Hint.vue'
import Icon from '@/vue/Elements/Icon/Icon.vue'
import Notifications from '@/vue/Elements/Notifications.vue'
import Pyrite from './app.js'

// Keep a global namespace around for debugging.
const app = globalThis.app = new Pyrite()

app.vm = createApp(App)

Object.assign(app.vm.config.globalProperties, {
    $env: app.env,
    $m: app.$m,
    $s: app.$s,
})

app.vm.component('ButtonGroup', ButtonGroup)
app.vm.component('Notifications', Notifications)
app.vm.component('Icon', Icon)
app.vm.component('ContextInput', ContextInput)
app.vm.component('ContextSelect', ContextSelect)
app.vm.component('FieldCheckbox', FieldCheckbox)
app.vm.component('FieldFile', FieldFile)
app.vm.component('FieldSelect', FieldSelect)
app.vm.component('FieldSlider', FieldSlider)
app.vm.component('FieldText', FieldText)
app.vm.component('Hint', Hint)

app.vm.directive('click-outside', {
    beforeMount(el, binding) {
        el.clickOutsideEvent = function(event) {
            if ((el === event.target) || !el.contains(event.target)) {
                binding.value(event, el)
            }
        }
        document.body.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
    },
});

(async() => {
    await app.init()
    app.vm.use(app.router).use(app.i18n)
    app.vm.mount('#app')
})()

