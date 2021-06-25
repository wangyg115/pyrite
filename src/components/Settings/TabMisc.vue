<template>
    <section v-if="$route.params.tabId === 'misc'" class="tab-content active">
        <FieldSelect
            v-model="$s.language"
            :help="$t('The user interface language')"
            :label="$t('Language')"
            name="language"
            :options="languages"
        />

        <FieldSelect
            v-model="$s.request"
            :help="$t('Stream types that you want to receive')"
            :label="$t('Acceptable Media')"
            name="request"
            :options="receiveOptions"
        />

        <FieldSelect
            v-model="$s.send"
            :help="$t('Network bandwidth to use for sending media')"
            :label="$t('Bandwidth')"
            name="send"
            :options="sendOptions"
        />
    </section>
</template>

<script>
export default {
    data() {
        return {
            languages: [
                {id: 'en', name: this.$t('English')},
                {id: 'nl', name: this.$t('Nederlands')},
            ],
            receiveOptions: [
                {id: 'nothing', name: this.$t('Nothing')},
                {id: 'audio', name: this.$t('Audio')},
                {id: 'screenshare', name: `${this.$t('Audio')} & ${this.$t('Screenshare')}`},
                {id: 'everything', name: `${this.$t('Audio')}, ${this.$t('Video')} & ${this.$t('Screenshare')}`},
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
        }
    },
}
</script>
