<template>
    <div class="c-settings content">
        <ul class="tabs">
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('miscellaneous')"
                :to="{name: 'settings', params: {tabId: 'misc'}}"
            >
                <Icon class="icon-small" name="SettingsMisc" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab tooltip"
                :data-tooltip="$t('devices')"
                :to="{name: 'settings', params: {tabId: 'devices'}}"
            >
                <Icon class="icon-small" name="Headset" />
            </RouterLink>
        </ul>

        <TabMisc v-if="$route.params.tabId === 'misc'" />
        <TabDevices v-else-if="$route.params.tabId === 'devices'" />

        <button
            class="btn btn-widget btn-save"
            @click="saveSettings"
        >
            {{ $t('Save Settings') }}
        </button>
    </div>
</template>

<script>
import TabDevices from './TabDevices.vue'
import TabMisc from './TabMisc.vue'

export default {
    components: {TabDevices, TabMisc},
    methods: {
        changeAudioSelect() {
            app.changePresentation()
        },
        changeVideoSelect() {
            if (this.$s.connected) {
                app.changePresentation()
            }
        },
        saveSettings() {
            app.i18n.global.locale = this.$s.language.id
            app.logger.debug(`settings language to ${this.$s.language.id}`)
            app.store.save()
            app.notify({level: 'info', message: 'Settings stored'})
        },
    },
}
</script>

<style lang="postcss">
.c-settings {

    & .tabs {
        padding-left: var(--space-1);
    }

    & .btn-save {
        margin-top: var(--space-1);
    }
}

</style>
