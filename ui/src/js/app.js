import '@/js/lib/helpers.js'
import '@/scss/app.scss'

import "@fontsource/oswald"
import "@fontsource/roboto"

import animate from './lib/animate.js'
import Api from './lib/api.js'
import App from '@/vue/Elements/App.vue'
import ButtonGroup from '@/vue/Elements/ButtonGroup.vue'
import ContextInput from '@/vue/Elements/Context/ContextInput.vue'
import ContextSelect from '@/vue/Elements/Context/ContextSelect.vue'
import {createApp} from 'vue'
import {createI18n} from 'vue-i18n'
import env from './lib/env.js'
import EventEmitter from 'eventemitter3'
import FieldCheckbox from '@/vue/Elements/Field/FieldCheckbox.vue'
import FieldFile from '@/vue/Elements/Field/FieldFile.vue'
import FieldSelect from '@/vue/Elements/Field/FieldSelect.vue'
import FieldSlider from '@/vue/Elements/Field/FieldSlider.vue'
import FieldText from '@/vue/Elements/Field/FieldText.vue'
import Hint from '@/vue/Elements/Hint.vue'
import Icon from '@/vue/Elements/Icon/Icon.vue'
import localeFR from './locales/fr.js'
import localeNL from './locales/nl.js'
import Logger from './lib/logger.js'
import ModelGroup from './models/group.js'
import ModelMedia from './models/media.js'
import ModelSFU from './models/sfu.js'
import ModelUser from './models/user.js'
import Notifications from '@/vue/Elements/Notifications.vue'
import Notifier from './lib/notifier.js'
import router from './router/router.js'
import Store from './lib/store.js'
import SoundMeter from '@/vue/Elements/SoundMeter.vue'

class Pyrite extends EventEmitter {

    constructor() {
        super()

        this.logger = new Logger(this)
        this.api = new Api()

        this.logger.setLevel('debug')

        this.animate = animate
        this.env = env

        this.logger.debug('loading store')
        this.store = new Store()
        this.$s = this.store.load()
        this.i18n = createI18n({
            formatFallbackMessages: true,
            locale: this.$s.language.id,
            messages: {
                fr: localeFR,
                nl: localeNL,
            },
            silentFallbackWarn: true,
            silentTranslationWarn: true,
        })

        this.$t = this.i18n.global.t
        this.notifier = Notifier(this)
        this.init()
    }

    async adminContext() {
        const context = await this.api.get('/api/context')
        Object.assign(this.$s.admin, context)
    }

    async init() {
        // All model logic is grouped here:
        this.$m = {
            group: new ModelGroup(),
            media: new ModelMedia(),
            sfu: new ModelSFU(),
            user: new ModelUser(),
        }

        await this.adminContext()
        this.router = router(this)
        this.router.beforeResolve((to, from, next) => {
            // All admin routes are authenticated. Redirect to the admin
            // login if the authentication flag is unset.
            if ((to.name && to.name !== 'admin-login' && to.name.startsWith('admin')) && !this.$s.admin.authenticated) {
                next({name: 'admin-login'})
                return
            }

            if (!this.$s.group.connected) {
                // Navigating groups will change the internally used groupId;
                // but only when not connected to a group already.
                if (to.name === 'conference-groups-disconnected') {
                    this.$s.group.name = to.params.groupId
                }
            } else if (to.name === 'admin-group') {
                this.$s.admin.group._name = to.params.groupId
            }
            next()
        })
        this.vm = createApp(App)

        Object.assign(this.vm.config.globalProperties, {
            $m: this.$m,
            $s: this.$s,
            app: this,
        })

        this.vm.component('ButtonGroup', ButtonGroup)
        this.vm.component('Notifications', Notifications)
        this.vm.component('Icon', Icon)
        this.vm.component('ContextInput', ContextInput)
        this.vm.component('ContextSelect', ContextSelect)
        this.vm.component('FieldCheckbox', FieldCheckbox)
        this.vm.component('FieldFile', FieldFile)
        this.vm.component('FieldSelect', FieldSelect)
        this.vm.component('FieldSlider', FieldSlider)
        this.vm.component('FieldText', FieldText)
        this.vm.component('Hint', Hint)
        this.vm.component('SoundMeter', SoundMeter)

        this.vm.directive('click-outside', {
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

        this.vm.use(this.router).use(this.i18n)
        this.vm.mount('#app')
    }

}

export let app = new Pyrite()
if (import.meta.env.DEV) globalThis.app = app
