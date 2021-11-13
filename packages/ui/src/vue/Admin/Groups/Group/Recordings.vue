<template>
    <section class="c-admin-recordings content">
        <header>
            <div class="notice" />
            <div class="title">
                <span v-if="$s.admin.group">{{ $s.admin.group._name }}</span>
                <Icon class="icon icon-regular" name="Record" />
            </div>
        </header>
        <div v-for="rec of recordings" :key="rec.filename" class="recording">
            <video controls :src="`/api/recordings/${$s.admin.group._name}/${rec.filename}.${rec.extension}`" type="video/webm" />
            <div class="info">
                <div class="line">
                    <div class="key">
                        {{ $t('Modified') }}
                    </div>
                    <div class="value">
                        {{ rec.atime }}
                    </div>
                </div>

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
            </div>
        </div>
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
        async loadRecordings(groupId) {
            this.recordings = await app.api.get(`/api/recordings/${groupId}`)
        },
    },
    mounted() {
        if (this.$s.admin.group) {
            const groupId = this.$s.admin.group._name
            this.loadRecordings(groupId)
        }
    },
}
</script>

<style lang="scss">

.c-admin-recordings {

    .recording {
        background: var(--grey-2);
        display: flex;
        padding: var(--spacer);

        video {
            border: 1px solid var(--grey-5);
            max-width: 200px;
        }

        .info {
            display: flex;
            flex-direction: column;

            .line {
                display: flex;
                padding: var(--space-05) var(--spacer);

                .key {

                    width: 100px;
                }
            }
        }
    }
}
</style>
