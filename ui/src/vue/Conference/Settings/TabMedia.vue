<template>
    <section class="tab-content active">
        <FieldSelect
            v-model="$s.media.accept"
            :help="$t('stream types that you want to be able to receive')"
            :label="$t('accepted media formats')"
            name="request"
            :options="acceptOptions"
        />

        <FieldSelect
            v-model="$s.devices.cam.resolution"
            :help="$t('supported resolutions depend on the device capabilities')"
            :label="$t('preferred resolution')"
            name="resolution"
            :options="resolutionOptions"
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
            resolutionOptions: [
                {
                    id: 'default',
                    name: this.$t('default'),
                },
                {
                    id: '720p',
                    name: this.$t('HD - 720p (1280x720)'),
                },
                {
                    help: this.$t('full HD may negatively affect the audio and video quality for others'),
                    id: '1080p',
                    name: this.$t('full HD - 1080p (1920x1080)'),
                },
            ],
            sendOptions: [
                {id: 'lowest', name: `${this.$t('lowest')} - 150 Kbps`},
                {id: 'low', name: `${this.$t('low')} - 300 Kbps`},
                {id: 'normal', name: `${this.$t('normal')} - 700 Kbps`},
                {
                    help: this.$t('unlimited bandwidth may negatively affect the audio and video quality for others'),
                    id: 'unlimited',
                    name: this.$t('unlimited'),
                },
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
