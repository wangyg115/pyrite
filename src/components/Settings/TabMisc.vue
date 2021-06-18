<template>
    <section v-if="$route.params.tabId === 'misc'" class="tab-content active">
        <FieldSelect
            v-model="$s.language"
            :help="$t('change the user interface language')"
            :label="$t('Language')"
            name="language"
            :options="languages"
        />
        <FieldSelect
            v-model="$s.send"
            :help="$t('Bandwidth to use for sending')"
            :label="$t('Bandwidth')"
            name="send"
            :options="sendOptions"
        />

        <FieldSelect
            v-model="$s.request"
            :help="$t('Incoming stream types to accept')"
            :label="$t('Accept Media')"
            name="request"
            :options="receiveOptions"
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
                {id: 'screenshare', name: `${this.$t('Audio')} & ${this.$t('Screensharing')}`},
                {id: 'everything', name: `${this.$t('Audio')}, ${this.$t('Video')} & ${this.$t('Screensharing')}`},
            ],
            sendOptions: [
                {id: 'lowest', name: `${this.$t('Lowest')} - 150 Kbps`},
                {id: 'low', name: `${this.$t('Low')} - 300 Kbps`},
                {id: 'normal', name: `${this.$t('Normal')} - 700 Kbps`},
                {id: 'unlimited', name: this.$t('Unlimited')},
            ],
        }
    },
}
</script>
