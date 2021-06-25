<template>
    <section v-if="$route.params.tabId === 'devices'" class="tab-content active">
        <div>
            <div class="camera-field">
                <FieldSelect
                    v-model="$s.video"
                    :help="$t('Select the camera device to use for conferencing')"
                    :label="$t('Camera')"
                    name="video"
                    :options="$s.devices.video"
                />
                <Stream v-if="description" v-model="description" :controls="false" />
            </div>

            <FieldSelect
                v-model="$s.resolution"
                :help="$t('This setting only has effect if your camera actually supports the preferred resolution.')"
                :label="$t('Preferred Resolution')"
                name="resolution"
                :options="resolutionOptions"
            />

            <FieldSelect
                v-model="$s.audio"
                :help="$t('Select the microphone device to use')"
                :label="$t('Microphone')"
                name="audio"
                :options="$s.devices.audio"
            />

            <div class="soundmeter">
                <SoundMeter v-if="streamId && stream" :stream="stream" :stream-id="streamId" />
            </div>
        </div>
    </section>
</template>

<script>
import SoundMeter from '../ui/SoundMeter.vue'
import Stream from '../Stream.vue'

export default {
    beforeUnmount() {
        if (!this.$s.group.connected) {
            app.delLocalMedia()
        }
    },
    components: {SoundMeter, Stream},
    data() {
        return {
            description: null,
            resolutionOptions: [
                {
                    id: 'default',
                    name: this.$t('Default'),
                },
                {
                    id: '720p',
                    name: this.$t('HD - 720p (1280x720)'),
                },
                {
                    help: this.$t('Full HD video may result in framerate decay'),
                    id: '1080p',
                    name: this.$t('Full HD - 1080p (1920x1080)'),
                },
            ],
            stream: null,
            streamId: null,
        }

    },
    async mounted() {
        // Not a media stream yet? Create one for the audio settings
        if (!app.localStream) {
            const res = await app.addLocalMedia()
            if (!res) {
                app.notify({level: 'error', message: 'Unable to find a valid device'})
                return
            }
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

<style lang="scss">
.camera-field {
    align-items: "stretch";
    display: flex;
    justify-content: "space-between";
    position: relative;

    .c-stream {
        background: var(--grey-400);
        border: var(--border) solid var(--grey-200);
        position: absolute;
        right: 0;
        width: 180px;
    }
}

</style>
