<template>
    <section v-if="$route.params.tabId === 'devices'" class="tab-content active">
        <div>
            <div class="camera-field">
                <FieldSelect
                    v-model="$s.video"
                    :help="$t('select the video camera to use')"
                    :label="$t('Camera')"
                    name="video"
                    :options="$s.devices.video"
                />
                <Stream v-if="description" v-model="description" :controls="false" />
            </div>

            <FieldSelect
                v-model="$s.audio"
                :help="$t('select the microphone to use')"
                :label="$t('Microphone')"
                name="audio"
                :options="$s.devices.audio"
            />

            <div class="soundmeter">
                <SoundMeter v-if="streamId && stream" :stream="stream" :stream-id="streamId" />
            </div>

            <FieldCheckbox
                v-model="$s.blackboardMode"
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
        if (!this.$s.connected) {
            app.delLocalMedia()
        }
    },
    components: {SoundMeter, Stream},
    data() {
        return {
            description: null,
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
        async '$s.audio'() {
            await app.addLocalMedia()
            this.stream = app.localStream
            this.streamId = app.localStream.id
        },
    },
}
</script>

<style lang="postcss">
.camera-field {
    align-items: "stretch";
    display: flex;
    justify-content: "space-between";
    position: relative;

    & .c-stream {
        background: var(--grey-400);
        border: var(--border) solid var(--grey-200);
        position: absolute;
        right: 0;
        /* height: 80px; */
        width: 180px;
    }
}

</style>
