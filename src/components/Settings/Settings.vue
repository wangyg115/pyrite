<template>
    <div class="content">
        <ul class="tabs">
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('miscellaneous')"
                :to="{name: 'settings', params: {tabId: 'misc'}}"
            >
                <icon class="icon-small" name="settingsMisc" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('devices')"
                :to="{name: 'settings', params: {tabId: 'devices'}}"
            >
                <icon class="icon-small" name="headset" />
            </RouterLink>
        </ul>

        <TabMisc v-if="$route.params.tabId === 'misc'" />
        <TabDevices v-else-if="$route.params.tabId === 'devices'" />

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

import TabDevices from './TabDevices.vue'
import TabMisc from './TabMisc.vue'

export default {
    name: 'Settings',
    components: {TabDevices, TabMisc},
    data() {
        return {
            state: app.state,
        }
    },
    methods: {
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
            console.log('CHANGE AUDIO SELECT')
            app.changePresentation()
        },
        changeVideoSelect() {
            if (this.state.connected) {
                app.changePresentation()
            }
        },
        changeBlackboardbox() {
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
<style lang="postcss">
.tabs {
    padding-left: var(--space-1);
}
</style>