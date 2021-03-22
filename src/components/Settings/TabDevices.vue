<template>
    <section v-if="$route.params.tabId === 'devices'" class="tab-content active">
        <div id="mediaoptions">
            <Stream v-if="description" v-model="description" :controls="false" />
            <FieldSelect
                v-model="state.video"
                :help="$t('select the video camera to use')"
                :label="$t('Camera')"
                name="video"
                :options="state.devices.video"
            />

            <FieldSelect
                v-model="state.audio"
                :help="$t('select the microphone to use')"
                :label="$t('Microphone')"
                name="audio"
                :options="state.devices.audio"
            />

            <SoundMeter v-if="streamId && stream" :stream="stream" :stream-id="streamId" />

            <FieldCheckbox
                v-model="state.blackboardMode"
                :help="$t('Increases resolution and lowers framerate')"
                :label="$t('Blackboard mode')"
                name="blackboard"
            />
        </div>
    </section>
</template>

<script>
import SoundMeter from '../ui/SoundMeter.vue'
import Stream from '../Stream.vue'

export default {
    beforeUnmount() {
        if (!this.state.connected) {
            app.delLocalMedia()
        }
    },
    components: {SoundMeter, Stream},
    data() {
        return {
            description: null,
            state: app.state,
            stream: null,
            streamId: null,
        }

    },
    async mounted() {
        // Not a media stream yet? Create one for the audio settings
        if (!app.localStream) {
            await app.addLocalMedia()
        }
        this.stream = app.localStream
        this.streamId = app.localStream.id
        this.description = {
            id: this.stream.id,
            isUp: true,
            kind: 'video',
            mirror: false,
            src: app.localStream,
            volume: {
                locked: false,
                value: 100,
            },
        }
    },
    watch: {
        async 'state.audio'() {
            await app.addLocalMedia()
            this.stream = app.localStream
            this.streamId = app.localStream.id
        },
    },
}
</script>
