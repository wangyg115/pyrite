<template>
    <section class="tab-content active">
        <FieldSelect
            v-model="$s.theme"
            :help="$t('Force a theme or use the system theme')"
            :label="$t('UI Theme')"
            name="language"
            :options="themes"
        />

        <FieldSelect
            v-model="$s.language"
            :help="$t('Changes the used UI language')"
            :label="$t('Language')"
            name="language"
            :options="languages"
        />

        <FieldSelect
            v-model="$s.media.accept"
            :help="$t('Stream types that you want to receive')"
            :label="$t('Acceptable Media Types')"
            name="request"
            :options="acceptOptions"
        />

        <FieldSelect
            v-model="$s.media.upstream"
            :help="$t('Network bandwidth to use for sending media')"
            :label="$t('Bandwidth')"
            name="send"
            :options="sendOptions"
        />
    </section>
</template>

<script>
import {nextTick} from 'vue'

export default {
    data() {
        return {
            acceptOptions: [
                {id: 'nothing', name: this.$t('Nothing')},
                {id: 'audio', name: this.$t('Audio')},
                {id: 'screenshare', name: `${this.$t('Audio')} & ${this.$t('Screenshare')}`},
                {id: 'everything', name: `${this.$t('Audio')}, ${this.$t('Video')} & ${this.$t('Screenshare')}`},
            ],
            languages: [
                {id: 'en', name: this.$t('English')},
                {id: 'nl', name: this.$t('Nederlands')},
            ],
            sendOptions: [
                {id: 'lowest', name: `${this.$t('Lowest')} - 150 Kbps`},
                {id: 'low', name: `${this.$t('Low')} - 300 Kbps`},
                {id: 'normal', name: `${this.$t('Normal')} - 700 Kbps`},
                {
                    help: this.$t('Using unlimited bandwidth may negatively affect the conferencing experience for others'),
                    id: 'unlimited',
                    name: this.$t('Unlimited'),
                },
            ],
            themes: [
                {id: 'system', name: this.$t('System')},
                {id: 'light', name: this.$t('Light')},
                {id: 'dark', name: this.$t('Dark')},
            ],
        }
    },
    watch: {
        async '$s.theme'() {
            await nextTick()
            const themeColor = getComputedStyle(document.querySelector('.app')).getPropertyValue('--grey-4')
            app.logger.info(`setting theme color to ${themeColor}`)
            document.querySelector('meta[name="theme-color"]').content = themeColor
        },
    },
}
</script>
