<template>
    <div class="content">
        <ul class="tabs">
            <li
                class="btn btn-menu tab tooltip"
                :class="classes('tabs', 'misc')"
                :data-tooltip="$t('miscellaneous')"
                @click="setTab('settings', 'misc')"
            >
                <icon class="icon-small" name="settingsMisc" />
            </li>
            <li
                class="btn btn-menu tab tooltip"
                :class="classes('tabs', 'devices')"
                :data-tooltip="$t('devices')"
                @click="setTab('settings', 'devices')"
            >
                <icon class="icon-small" name="headset" />
            </li>
        </ul>

        <section class="tab-content" :class="{active: state.tabs.settings.active === 'misc'}">
            <FieldSelect
                v-model="state.language"
                :help="$t('change the user interace language')"
                :label="$t('Language')"
                name="language"
                :options="languages"
            />
            <FieldSelect
                v-model="state.send"
                :help="$t('Bandwidth to use when sending media')"
                :label="$t('Send')"
                name="send"
                :options="sendOptions"
            />

            <FieldSelect
                v-model="state.request"
                :help="$t('Types of media to receive')"
                :label="$t('Receive')"
                name="request"
                :options="receiveOptions"
            />

            <FieldCheckbox
                v-model="state.activityDetection"
                :help="$t('Detect whether someone is speaking')"
                :label="$t('Activity detection')"
                name="activity"
            />
        </section>


        <section class="tab-content" :class="{active: state.tabs.settings.active === 'devices'}">
            <div v-show="state.permissions.present" id="mediaoptions">
                <FieldSelect
                    v-model="state.video"
                    :help="$t('select the video camera to use')"
                    :label="$t('Camera')"
                    name="video"
                    :options="state.devices.video"
                />

                <FieldSelect
                    v-model="state.audio"
                    :help="$t('select the microphone to use')"
                    :label="$t('Microphone')"
                    name="audio"
                    :options="state.devices.audio"
                />

                <SoundMeter v-if="state.mediaReady" />

                <FieldCheckbox
                    v-model="state.blackboardMode"
                    :help="$t('Increases resolution and lowers framerate')"
                    :label="$t('Blackboard mode')"
                    name="blackboard"
                />
            </div>
        </section>

        <button
            id="connectbutton"
            class="btn btn-widget"
            @click="saveSettings"
        >
            {{ $t('Save') }}
        </button>
    </div>
</template>

<script>
import SoundMeter from './ui/SoundMeter.vue'

export default {
    name: 'Settings',
    components: {SoundMeter},
    data() {
        return {
            languages: [
                {id: 'en', name: this.$t('English')},
                {id: 'nl', name: this.$t('Nederlands')}
            ],
            receiveOptions: [
                {id: 'nothing', name: this.$t('Nothing')},
                {id: 'audio', name: this.$t('Audio')},
                {id: 'screenshare', name: this.$t('Screenshare')},
                {id: 'everything', name: this.$t('Everything')}
            ],
            sendOptions: [
                {id: 'lowest', name: this.$t('Lowest')},
                {id: 'low', name: this.$t('Low')},
                {id: 'normal', name: this.$t('Normal')},
                {id: 'unlimited', name: this.$t('Unlimited')}
            ],
            state: app.state,
        }
    },
    methods: {
        classes: function(block, modifier) {
            let classes = {}
            if (block === 'tabs') {
                if (modifier === this.state.tabs.settings.active) classes.active = true
            }
            return classes
        },
        changeActivitybox(e) {
            if(!(this instanceof HTMLInputElement))
                throw new Error('Unexpected type for this')
            updateSettings({activityDetection: this.checked})
            for(let id in serverConnection.down) {
                let c = serverConnection.down[id]
                if(this.checked)
                    c.setStatsInterval(activityDetectionInterval)
                else {
                    c.setStatsInterval(0)
                    setActive(c, false)
                }
            }
        },
        changeAudioSelect() {
            app.store.save()
            if (this.state.connected) {
                app.changePresentation()
            }
        },
        changeFileInput() {
            if(!(this instanceof HTMLInputElement))
                throw new Error('Unexpected type for this')
            let input = this
            let files = input.files
            for(let i = 0; i < files.length; i++)
                addFileMedia(files[i])
            input.value = ''
            this.closeNav()
        },
        changeVideoSelect() {
            app.store.save()
            if (this.state.connected) {
                app.changePresentation()
            }
        },
        changeBlackboardbox() {
            app.store.save()
            app.changePresentation()
        },
        changeRequestSelect() {
            e.preventDefault()
            if(!(this instanceof HTMLSelectElement))
                throw new Error('Unexpected type for this')
            updateSettings({request: this.value})
            serverConnection.request(this.value)
        },
        async changeSendSelect() {
            if(!(this instanceof HTMLSelectElement))
            throw new Error('Unexpected type for this')
            updateSettings({send: this.value})
            let t = getMaxVideoThroughput()
            for(let id in serverConnection.up) {
                let c = serverConnection.up[id]
                await setMaxVideoThroughput(c, t)
            }
        },
        closeNav() {
            document.getElementById("sidebarnav").style.width = "0"
        },
        closeSide() {
            this.closeNav()
        },
        disconnect() {
            app.connection.close()
            this.closeNav()
        },
        saveSettings() {
            app.i18n.global.locale = this.state.language.id
            app.logger.debug(`settings language to ${this.state.language.id}`)
            app.store.save()
            app.notify({level: 'info', message: 'Settings stored'})
        },
        setTab: function(category, tab) {
            app.state.tabs[category] = {active: tab}
        }
    }
}
</script>