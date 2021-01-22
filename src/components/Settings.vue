<template>
    <div class="content">
        <ul class="tabs">
            <li
                class="btn btn-menu tab tooltip tooltip-bottom"
                :class="classes('tabs', 'devices')"
                data-tooltip="devices"
                @click="setTab('settings', 'devices')"
            >
                <icon class="icon-small" name="headset" />
            </li>
            <li
                class="btn btn-menu tab tooltip tooltip-bottom"
                :class="classes('tabs', 'misc')"
                data-tooltip="Miscellaneous"
                @click="setTab('settings', 'misc')"
            >
                <icon class="icon-small" name="settingsMisc" />
            </li>
        </ul>

        <section class="tab-content" :class="{active: state.tabs.settings.active === 'devices'}">
            <div v-show="state.permissions.present" id="mediaoptions">
                <FieldSelect
                    v-model="state.video"
                    help="select the video camera to use"
                    label="Camera"
                    name="language"
                    :options="state.devices.video"
                />

                <FieldSelect
                    v-model="state.audio"
                    help="select the video camera to use"
                    label="Microphone"
                    name="language"
                    :options="state.devices.audio"
                />

                <SoundMeter v-if="state.mediaReady" />

                <FieldCheckbox
                    v-model="state.blackboardMode"
                    help="Stream at extra high resolution"
                    label="Blackboard mode"
                    name="blackboard"
                />
            </div>
        </section>

        <section class="tab-content" :class="{active: state.tabs.settings.active === 'misc'}">
            <FieldSelect
                v-model="state.send"
                help="Bandwidth to use when sending media"
                label="Send"
                name="send"
                :options="sendOptions"
            />

            <FieldSelect
                v-model="state.request"
                help="Types of media to receive"
                label="Receive"
                name="request"
                :options="receiveOptions"
            />


            <FieldCheckbox
                v-model="state.activityDetection"
                help="Detect whether someone is speaking"
                label="Activity detection"
                name="activity"
            />
        </section>

        <button
            id="connectbutton"
            class="btn btn-widget"
            @click="saveSettings"
        >
            Save
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
            receiveOptions: [
                {id: 'nothing', name: 'Nothing'},
                {id: 'audio', name: 'Audio'},
                {id: 'screenshare', name: 'Screenshare'},
                {id: 'everything', name: 'Everything'}
            ],
            sendOptions: [
                {id: 'lowest', name: 'Lowest'},
                {id: 'low', name: 'Low'},
                {id: 'normal', name: 'Normal'},
                {id: 'unlimited', name: 'Unlimited'}
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
            app.store.save()
            app.notify({level: 'info', message: 'Settings stored'})
        },
        setTab: function(category, tab) {
            app.state.tabs[category] = {active: tab}
        }
    }
}
</script>