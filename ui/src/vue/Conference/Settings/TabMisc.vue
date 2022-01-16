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

        <FieldSelect
            v-model="$s.media.accept"
            :help="$t('stream types that you want to be able to receive')"
            :label="$t('accepted media formats')"
            name="request"
            :options="acceptOptions"
        />

        <FieldSelect
            v-model="$s.media.upstream"
            :help="$t('bandwidth to use for sending media')"
            :label="$t('bandwidth')"
            name="send"
            :options="sendOptions"
        />
    </section>
</template>

<script>
import app from '@/js/app.js'
import {nextTick} from 'vue'

export default {
    data() {
        return {
            acceptOptions: [
                {id: 'nothing', name: this.$t('nothing')},
                {id: 'audio', name: this.$t('audio')},
                {id: 'screenshare', name: `${this.$t('audio')} & ${this.$t('screenshare')}`},
                {id: 'everything', name: `${this.$t('audio')}, ${this.$t('video')} & ${this.$t('screenshare')}`},
            ],
            languages: [
                {id: 'en', name: this.$t('english')},
                {id: 'fr', name: this.$t('french')},
                {id: 'nl', name: this.$t('dutch')},
            ],
            sendOptions: [
                {id: 'lowest', name: `${this.$t('lowest')} - 150 Kbps`},
                {id: 'low', name: `${this.$t('low')} - 300 Kbps`},
                {id: 'normal', name: `${this.$t('normal')} - 700 Kbps`},
                {
                    help: this.$t('using unlimited bandwidth may negatively affect the conferencing experience for others'),
                    id: 'unlimited',
                    name: this.$t('unlimited'),
                },
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
            app.logger.info(`setting theme color to ${themeColor}`)
            document.querySelector('meta[name="theme-color"]').content = themeColor
        },
    },
}
</script>
