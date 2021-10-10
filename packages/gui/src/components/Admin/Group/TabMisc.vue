<template>
    <section class="c-admin-group-tab-misc tab-content active">
        <FieldText
            v-model="$s.admin.group.name"
            label="Group Name"
            placeholder="..."
        />
        <FieldText
            v-model="$s.admin.group.description"
            help="Add a short description to the group listing page"
            label="Group Description"
            placeholder="..."
        />
        <FieldText
            v-model="$s.admin.group.contact"
            help="Show contact information to a group administrator"
            label="Group Contact"
            placeholder="..."
        />
        <FieldText
            v-model="$s.admin.group.comment"
            help="Add a comment to the group login page"
            label="Group Comment"
            placeholder="..."
        />
        <FieldCheckbox
            v-model="$s.admin.group['allow-recording']"
            help="When enabled, recording of this group is allowed"
            label="Recording"
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
