<template>
    <section v-if="$route.params.tabId === 'misc'" class="tab-content active">
        <FieldSelect
            v-model="state.language"
            :help="$t('change the user interface language')"
            :label="$t('Language')"
            name="language"
            :options="languages"
        />
        <FieldSelect
            v-model="state.send"
            :help="$t('Bandwidth to use when sending media')"
            :label="$t('Send')"
            name="send"
            :options="sendOptions"
        />

        <FieldSelect
            v-model="state.request"
            :help="$t('Types of media to receive')"
            :label="$t('Receive')"
            name="request"
            :options="receiveOptions"
        />

        <FieldCheckbox
            v-model="state.activityDetection"
            :help="$t('Detect whether someone is speaking')"
            :label="$t('Activity detection')"
            name="activity"
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
                {id: 'screenshare', name: this.$t('Screenshare')},
                {id: 'everything', name: this.$t('Everything')},
            ],
            sendOptions: [
                {id: 'lowest', name: this.$t('Lowest')},
                {id: 'low', name: this.$t('Low')},
                {id: 'normal', name: this.$t('Normal')},
                {id: 'unlimited', name: this.$t('Unlimited')},
            ],
            state: app.state,
        }
    },
}
</script>
