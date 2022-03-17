<template>
    <section class="c-admin-group-tab-misc tab-content active">
        <FieldText
            v-model="$s.admin.group._newName"
            :label="$t('group name')"
            placeholder="..."
        />
        <FieldText
            v-model="$s.admin.group.description"
            :help="$t('add a short description to the group listing page')"
            :label="$t('group description')"
            placeholder="..."
        />
        <FieldText
            v-model="$s.admin.group.contact"
            :help="$t('show contact information to a group operator')"
            :label="$t('group contact')"
            placeholder="..."
        />
        <FieldText
            v-model="$s.admin.group.comment"
            :help="$t('add a short text to the group login page')"
            :label="$t('group comment')"
            placeholder="..."
        />
        <FieldCheckbox
            v-model="$s.admin.group['allow-recording']"
            :help="$t('enables recording of the group streams')"
            :label="$t('recording')"
        />
        <FieldMultiSelect
            v-model="$s.admin.group.codecs"
            :help="$t('allowed group codecs (default: VP8 & Opus)')"
            :label="$t('codecs')"
            :options="codecs"
        />
        <FieldNumber
            v-model="$s.admin.group['max-history-age']"
            :help="$t('chat history retention in seconds (default: 14400, i.e. 4 hours)')"
            :label="$t('chat retention')"
        />
    </section>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    data() {
        return {
            codecs: [
                {
                    help: this.$t('compatible with all supported browsers'),
                    id: 'vp8',
                    name: 'VP8',
                },
                {
                    help: this.$t('better video quality, but incompatible with Safari'),
                    id: 'vp9',
                    name: 'VP9',
                },
                {
                    help: this.$t('even better video quality, only supported by some browsers, recording is not supported, SVC is not supported'),
                    id: 'av1',
                    name: 'AV1',
                },
                {
                    help: this.$t('incompatible with Debian and with some Android devices, SVC is not supported'),
                    id: 'h264',
                    name: 'H264',
                },
                {
                    help: this.$t('only Opus can be recorded to disk'),
                    id: 'opus',
                    name: 'Opus',
                },
                {
                    help: this.$t('does not support recording to disk'),
                    id: 'g722',
                    name: 'G722',
                },
                {
                    help: this.$t('does not support recording to disk'),
                    id: 'pcmu',
                    name: 'PCMU',
                },
                {
                    help: this.$t('does not support recording to disk'),
                    id: 'pcma',
                    name: 'PCMA',
                },
            ],
        }
    },
})
</script>
