import './css/pyrite.css'
import App from './App.vue'
import { createApp } from 'vue'
import FieldCheckbox from './components/ui/fields/FieldCheckbox.vue'
import FieldSelect from './components/ui/fields/FieldSelect.vue'
import FieldSlider from './components/ui/fields/FieldSlider.vue'
import FieldText from './components/ui/fields/FieldText.vue'
import Icon from './components/ui/icons/Icon.vue'
import Pyrite from './js/app.js'

const app = globalThis.app = new Pyrite()

app.vm = createApp(App)
app.vm.component('Icon', Icon)
app.vm.component('FieldText', FieldText)
app.vm.component('FieldSelect', FieldSelect)
app.vm.component('FieldCheckbox', FieldCheckbox)
app.vm.component('FieldSlider', FieldSlider)

app.vm.directive('click-outside', {
    beforeMount(el, binding) {
        el.clickOutsideEvent = function(event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event, el)
            }
        }
        document.body.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
    },
})

app.vm.use(app.router).use(app.i18n)

app.vm.mount('#app')

