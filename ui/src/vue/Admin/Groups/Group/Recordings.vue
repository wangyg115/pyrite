<template>
    <section v-if="recordings.length" class="c-admin-recordings tab-content active">
        <div v-for="rec of recordings" :key="rec.filename" class="recording">
            <video controls :src="`/api/recordings/${$s.admin.group._name}/${rec.filename}.${rec.extension}`" type="video/webm" />
            <div class="info">
                <div class="line">
                    <div class="key">
                        {{ $t('Filename') }}
                    </div>
                    <div class="value">
                        {{ rec.filename }}
                    </div>
                </div>

                <div class="line">
                    <div class="key">
                        {{ $t('Type') }}
                    </div>
                    <div class="value">
                        {{ rec.extension }}
                    </div>
                </div>

                <div class="line">
                    <div class="key">
                        {{ $t('Size') }}
                    </div>
                    <div class="value">
                        {{ (rec.size / 1024 / 1024).toFixed(2) }} MB
                    </div>
                </div>

                <div class="line">
                    <div class="key">
                        {{ $t('Modified') }}
                    </div>
                    <div class="value">
                        {{ rec.atime }}
                    </div>
                </div>
            </div>
            <div class="actions">
                <button
                    class="btn btn-menu btn-small tooltip tooltip-right"
                    :data-tooltip="`${$t('Delete recording')}`"
                    @click="deleteRecording(rec)"
                >
                    <Icon class="icon-mini" name="Trash" />
                </button>
                <a
                    class="btn btn-menu btn-small tooltip tooltip-right"
                    :data-tooltip="`${$t('Download recording')}`"
                    :download="`${rec.filename}.${rec.extension}`"
                    :href="`/api/recordings/${$s.admin.group._name}/${rec.filename}.${rec.extension}`"
                >
                    <Icon class="icon-mini" name="Download" />
                </a>
            </div>
        </div>
    </section>
    <section v-else class="c-admin-recordings tab-content active no-results">
        <Icon class="icon icon-large" name="Record" />
        <span>{{ $t('No recordings yet') }}</span>
    </section>
</template>

<script>
export default {
    data() {
        return {
            recordings: [],
        }
    },
    methods: {
        async deleteRecording(rec) {
            this.recordings = await app.api.get(`/api/recordings/${this.groupId}/${rec.filename}.${rec.extension}/delete`)
            app.notifier.notify({level: 'info', message: this.$t('Deleted recording {recording}', {recording: rec.filename})})
        },
        async loadRecordings(groupId) {
            this.recordings = await app.api.get(`/api/recordings/${groupId}`)
        },
    },
    mounted() {
        this.loadRecordings(this.groupId)
    },
    props: {
        groupId: {
            default: () => null,
            required: false,
            type: String,
        },
    },
    watch: {
        groupId(newValue) {
            this.loadRecordings(newValue)
        },
    },
}
</script>

<style lang="scss">
.c-admin-recordings {

    .recording {
        background: var(--grey-1);
        display: flex;

        video {
            border: 1px solid var(--grey-5);
            max-width: 200px;
        }

        .actions {
            background: var(--grey-2);
        }

        .info {
            display: flex;
            flex: 1;
            flex-direction: column;
            justify-content: center;

            .line {
                display: flex;
                font-size: var(--text-small);
                padding: var(--space-05) var(--spacer);

                .key {
                    color: var(--grey-6);
                    padding-right: var(--spacer);
                    text-align: right;
                    width: 75px;
                }

                .value {
                    color: var(--grey-8);
                }
            }
        }
    }
}
</style>
