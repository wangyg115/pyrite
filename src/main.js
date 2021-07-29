import './scss/app.scss'
import App from './App.vue'
import ContextInput from './components/ui/fields/ContextInput.vue'
import {createApp} from 'vue'
import FieldCheckbox from './components/ui/fields/FieldCheckbox.vue'
import FieldFile from './components/ui/fields/FieldFile.vue'
import FieldSelect from './components/ui/fields/FieldSelect.vue'
import FieldSlider from './components/ui/fields/FieldSlider.vue'
import FieldText from './components/ui/fields/FieldText.vue'
import Hint from './components/ui/Hint.vue'
import Icon from './components/ui/icons/Icon.vue'
import Pyrite from './js/app.js'

// Keep a global namespace around for debugging.
const app = globalThis.app = new Pyrite()

app.vm = createApp(App)
app.vm.config.globalProperties.$s = app.$s

app.vm.component('Icon', Icon)
app.vm.component('ContextInput', ContextInput)
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
})

app.vm.use(app.router).use(app.i18n)
app.vm.mount('#app')

