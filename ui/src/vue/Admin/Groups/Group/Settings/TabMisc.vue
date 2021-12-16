<template>
    <section v-if="$s.admin.group" class="c-admin-group-tab-misc tab-content active">
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

        <!-- <FieldText
            v-model.number="$s.admin.group['max-history-age']"
            help="The time, in seconds, during which chat history is kept (default 14400, i.e. 4 hours)"
            label="Keep Chat History"
            placeholder="..."
        /> -->
    </section>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    setup() {

    },
})
</script>
