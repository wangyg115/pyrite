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
import groupModel from './models/group.js'
import Hint from '@/vue/Elements/Hint.vue'
import Icon from '@/vue/Elements/Icon/Icon.vue'
import localeFR from './locales/fr.js'
import localeNL from './locales/nl.js'
import Logger from './lib/logger.js'
import Notifications from '@/vue/Elements/Notifications.vue'
import Notifier from './lib/notifier.js'
import router from './router/router.js'
import sfuModel from './models/sfu.js'
import Store from './lib/store.js'
import userModel from './models/user.js'

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

    async getUserMedia(presence) {
        this.$s.mediaReady = false
        // Cleanup the old networked stream first:
        if (this.localStream && this.$s.group.connected) {
            this.$m.sfu.delUpMediaKind('camera')
        }

        if (this.localStream) {
            this.$m.sfu.delLocalMedia()
        }

        await this.queryDevices()

        let selectedAudioDevice = false
        let selectedVideoDevice = false

        if (this.$s.devices.mic.selected.id !== null) selectedAudioDevice = {deviceId: this.$s.devices.mic.selected.id}
        if (this.$s.devices.cam.selected.id !== null) selectedVideoDevice = {deviceId: this.$s.devices.cam.selected.id}

        if (presence) {
            if (!presence.cam.enabled) selectedVideoDevice = false
            if (!presence.mic.enabled) selectedAudioDevice = false
            // A local stream cannot be initialized with neither audio and video; return early.
            if (!presence.cam.enabled && !presence.mic.enabled) {
                return
            }
        }

        // Verify whether the local mediastream is using the proper device setup.
        this.logger.debug(`using cam ${this.$s.devices.cam.selected.name}`)
        this.logger.debug(`using mic ${this.$s.devices.mic.selected.name}`)

        if(selectedVideoDevice) {
            if (this.$s.devices.cam.resolution.id === '720p') {
                this.logger.debug(`using 720p resolution`)
                selectedVideoDevice.width = {ideal: 1280, min: 640}
                selectedVideoDevice.height = {ideal: 720, min: 400}
            } else if(this.$s.devices.cam.resolution.id === '1080p') {
                this.logger.debug(`using 1080p resolution`)
                selectedVideoDevice.width = {ideal: 1920, min: 640}
                selectedVideoDevice.height = {ideal: 1080, min: 400}
            }
        }

        const constraints = {
            audio: selectedAudioDevice,
            video: selectedVideoDevice,
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints)

        } catch(message) {
            this.notifier.notify({level: 'error', message})
            return
        }

        // Add local stream to Galène; handle peer connection logic.
        if (this.$s.group.connected) {
            await this.$m.sfu.addUserMedia()
        }

        this.$s.mediaReady = true
        return this.localStream
    }

    async init() {
        // All model logic is grouped here:
        this.$m = {
            group: groupModel,
            sfu: sfuModel(),
            user: userModel,
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
            $env: this.env,
            $m: this.$m,
            $s: this.$s,
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

    async queryDevices() {
        let devices = await navigator.mediaDevices.enumerateDevices()
        const labelnr = {audio: 1, cam: 1, mic: 1}

        const added = []

        this.$s.devices.mic.options = []
        this.$s.devices.cam.options = []
        this.$s.devices.audio.options = []

        for (const device of devices) {
            // The same device may end up in the queryList multiple times;
            // Don't add it twice to the options list.
            if (added.includes(device.deviceId)) {
                continue
            }
            let name = device.label

            if(device.kind === 'videoinput') {
                if(!name) name = `Camera ${labelnr.cam}`
                this.$s.devices.cam.options.push({id: device.deviceId, name})
                labelnr.cam++
            } else if(device.kind === 'audioinput') {
                if(!name) name = `Microphone ${labelnr.mic}`
                this.$s.devices.mic.options.push({id: device.deviceId, name})
                labelnr.mic++
            } else if (device.kind === 'audiooutput') {
                // Firefox doesn't support audiooutput enumeration and setSinkid
                if(!name) name = `Output ${labelnr.audio}`
                this.$s.devices.audio.options.push({id: device.deviceId, name})
                labelnr.audio++
            }

            added.push(device.deviceId)
        }

        // Set default audio/video options when none is set.
        if (this.$s.devices.mic.selected.id === null && this.$s.devices.mic.options.length) {
            this.$s.devices.mic.selected = this.$s.devices.mic.options[0]
        }

        if (this.$s.devices.cam.selected.id === null && this.$s.devices.cam.options.length) {
            this.$s.devices.cam.selected = this.$s.devices.cam.options[0]
        }

        if (this.$s.devices.audio.selected.id === null && this.$s.devices.audio.options.length) {
            this.$s.devices.audio.selected = this.$s.devices.audio.options[0]
        }

        this.logger.debug(`device list updated`)
    }

}

// Keep a global namespace around for debugging.
const app = new Pyrite()
if (import.meta.env.DEV) globalThis.app = app

export default app
