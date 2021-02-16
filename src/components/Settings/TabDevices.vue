<template>
    <section v-if="$route.params.tabId === 'devices'" class="tab-content active">
        <div id="mediaoptions">
            <Stream v-if="peer" :peer="peer" />
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
    components: {Stream, SoundMeter},
    data() {
        return {
            peer: null,
            stream: null,
            streamId: null,
            state: app.state,
        }

    },
    watch: {
        async 'state.audio' () {
            await app.addLocalMedia()
            this.stream = app.localStream
            this.streamId = app.localStream.id
        }
    },
    async mounted() {
        // Not a media stream yet? Create one for the audio settings
        if (!app.localStream) {
            await app.addLocalMedia()
        }
        this.stream = app.localStream
        this.streamId = app.localStream.id
        this.peer = {
            id: this.stream.id,
            isUp: true,
            kind: 'video',
            mirror: false,
            src: app.localStream
        }
    },
    beforeUnmount() {
        if (!this.state.connected) {
            app.delLocalMedia()
        }
        console.log('UNMOUNTE')
    }
}
</script>