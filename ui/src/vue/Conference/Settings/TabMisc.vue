<template>
    <section class="tab-content active">
        <FieldSelect
            v-model="$s.theme"
            :help="$t('select a theme or use the system default')"
            :label="$t('theme')"
            name="language"
            :options="themes"
        />

        <FieldSelect
            v-model="$s.language"
            :help="$t('user interface language (i18n)')"
            :label="$t('language')"
            name="language"
            :options="languages"
        />
    </section>
</template>

<script>
import {nextTick} from 'vue'

export default {
    data() {
        return {
            languages: [
                {id: 'en', name: this.$t('english')},
                {id: 'fr', name: this.$t('french')},
                {id: 'nl', name: this.$t('dutch')},
                {id: 'zh', name: this.$t('chinese')},
            ],
            themes: [
                {id: 'system', name: this.$t('system')},
                {id: 'light', name: this.$t('light')},
                {id: 'dark', name: this.$t('dark')},
            ],
        }
    },
    watch: {
        async '$s.theme'() {
            await nextTick()
            const themeColor = getComputedStyle(document.querySelector('.app')).getPropertyValue('--grey-4')
            this.app.logger.info(`setting theme color to ${themeColor}`)
            document.querySelector('meta[name="theme-color"]').content = themeColor
        },
    },
}
</script>
