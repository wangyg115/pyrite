<template>
    <section v-if="$route.params.tabId === 'devices'" class="c-tab-devices tab-content active">
        <div class="camera-field">
            <FieldSelect
                v-model="$s.devices.cam.selected"
                :help="$t('Select the camera device for presence')"
                :label="$t('Camera')"
                name="video"
                :options="$s.devices.cam.options"
            />

            <div v-if="$s.group.connected" class="field connected-warning">
                <Icon class="icon icon-small" name="Warning" />
                {{ $t('You are currently streaming to other people') }}
            </div>
            <Stream v-if="description" v-model="description" :controls="false" />
        </div>

        <FieldSelect
            v-model="$s.devices.cam.resolution"
            :help="$t('Depends on the camera\'s capabilities')"
            :label="$t('Preferred Resolution')"
            name="resolution"
            :options="resolutionOptions"
        />

        <FieldSelect
            v-model="$s.devices.mic.selected"
            :help="$t('Select the microphone device')"
            :label="$t('Microphone')"
            name="audio"
            :options="$s.devices.mic.options"
        />

        <div class="soundmeter">
            <SoundMeter v-if="streamId && stream" :stream="stream" :stream-id="streamId" />
        </div>
    </section>
</template>

<script>
import {nextTick} from 'vue'
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
                    help: this.$t('Full HD video requires extensive bandwidth!'),
                    id: '1080p',
                    name: this.$t('Full HD - 1080p (1920x1080)'),
                },
            ],
            stream: null,
            streamId: null,
        }
    },
    methods: {
        async remountStream() {
            this.stream = await app.getUserMedia()
            this.streamId = this.stream.id
            this.description = null
            // Give the stream time to unmount first...
            await nextTick()

            this.description = {
                direction: 'up',
                hasAudio: app.$s.devices.mic.enabled,
                hasVideo: app.$s.devices.cam.enabled,
                id: this.stream.id,
                kind: 'video',
                mirror: false,
                src: this.stream,
                volume: {
                    locked: false,
                    value: 100,
                },
            }
        },
    },
    async mounted() {
        // Not a media stream yet? Create one for the audio settings
        if (!app.localStream) {
            const res = await app.getUserMedia()
            if (!res) {
                app.notify({level: 'error', message: 'Unable to find a valid device'})
                return
            }
        }
        this.stream = app.localStream
        this.streamId = app.localStream.id
        this.description = {
            direction: 'up',
            hasAudio: app.$s.devices.mic.enabled,
            hasVideo: app.$s.devices.cam.enabled,
            id: this.stream.id,
            kind: 'video',
            mirror: false,
            src: this.stream,
            volume: {
                locked: false,
                value: 100,
            },
        }
    },
    watch: {
        '$s.devices.cam.resolution'() {
            this.remountStream()
        },
        '$s.devices.cam.selected'() {
            this.remountStream()
        },
        '$s.devices.mic.selected'() {
            this.remountStream()
        },
    },
}
</script>

<style lang="scss">
.c-tab-devices {

    .connected-warning {
        align-items: center;
        display: flex;
        font-family: var(--font-secondary);

        .icon {
            color: var(--warning-color);
            margin-right: var(--spacer);
        }
    }

    .camera-field {
        display: flex;
        flex-direction: column;

        .c-stream {
            border: var(--border) solid var(--grey-200);
            margin: var(--spacer);
            right: 0;
            width: 180px;
        }
    }

}

</style>
