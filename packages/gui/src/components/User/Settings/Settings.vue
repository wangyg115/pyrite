<template>
    <div class="c-settings content">
        <header>
            <Icon class="item-icon icon-small" name="Settings" />Settings
            <div class="actions">
                <button
                    class="btn btn-login"
                    @click="saveSettings"
                >
                    {{ $t('Save Settings') }}
                </button>
            </div>
        </header>
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
    </div>
</template>

<script>
import TabDevices from './TabDevices.vue'
import TabMisc from './TabMisc.vue'

export default {
    components: {TabDevices, TabMisc},
    methods: {
        saveSettings() {
            app.i18n.global.locale = this.$s.language.id
            app.logger.debug(`settings language to ${this.$s.language.id}`)
            app.store.save()
            app.notifier.notify({level: 'info', message: this.$t('Settings stored')})
        },
    },
}
</script>

<style lang="scss">
.c-settings {

    header {

    }

    .btn-save {
        margin-top: var(--space-1);
    }
}

</style>
