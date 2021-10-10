<template>
    <section class="c-manager-group-tab-misc tab-content active">
        ID: {{ $s.admin.user.id }}
        <FieldText
            v-model="$s.admin.user.name"
            label="Username"
            placeholder="..."
        />
        <FieldText
            v-model="$s.admin.user.password"
            label="User Password"
            placeholder="..."
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
