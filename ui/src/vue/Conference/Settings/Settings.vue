<template>
    <div class="c-settings content">
        <header>
            <div class="notice" />
            <div class="title">
                <span>{{ $t('settings') }}</span>
                <Icon class="item-icon icon-regular" name="Settings" />
            </div>
        </header>
        <ul class="tabs">
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('miscellaneous')"
                :to="{name: 'conference-settings', params: {tabId: 'misc'}}"
            >
                <Icon class="icon-small" name="SettingsMisc" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('devices')"
                :to="{name: 'conference-settings', params: {tabId: 'devices'}}"
            >
                <Icon class="icon-small" name="Headset" />
            </RouterLink>
        </ul>

        <div class="tabs-content">
            <TabMisc v-if="$route.params.tabId === 'misc'" />
            <TabDevices v-else-if="$route.params.tabId === 'devices'" />

            <div class="actions">
                <button
                    class="btn btn-menu tooltip tooltip-left"
                    :data-tooltip="$t('save settings')"
                    @click="saveSettings"
                >
                    <Icon class="icon-small" name="Save" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import TabDevices from './TabDevices.vue'
import TabMisc from './TabMisc.vue'

export default {
    components: {TabDevices, TabMisc},
    methods: {
        saveSettings() {
            this.app.i18n.global.locale = this.$s.language.id
            this.app.logger.debug(`settings language to ${this.$s.language.id}`)
            this.app.store.save()
            this.app.notifier.notify({level: 'info', message: this.$t('Settings saved')})
        },
    },
}
</script>
