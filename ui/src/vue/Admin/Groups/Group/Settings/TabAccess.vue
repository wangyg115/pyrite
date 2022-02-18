<template>
    <section class="c-admin-group-tab-access tab-content active">
        <FieldCheckbox
            v-model="$s.admin.group.public"
            :help="$t('show the group in the public group list')"
            :label="$t('public group')"
        />
        <FieldCheckbox
            v-model="$s.admin.group['allow-anonymous']"
            :help="$t('allow people to connect without username')"
            :label="$t('anonymous login')"
        />
        <FieldCheckbox
            v-model="$s.admin.group['allow-subgroups']"
            :help="$t('group/subgroup gets automatically created on first use')"
            :label="$t('subgroups')"
        />

        <FieldCheckbox
            v-model="$s.admin.group.autolock"
            :help="$t('the group will start locked and stay locked whenever there are no clients with operator privileges')"
            :label="$t('autolock')"
        />

        <FieldCheckbox
            v-model="$s.admin.group.autokick"
            :help="$t('all participants will be removed, whenever there are no more participants with operator privileges')"
            :label="$t('autokick')"
        />

        <FieldNumber
            v-model.number="$s.admin.group['max-clients']"
            :help="$t('maximum number of clients that may participate in a group')"
            :label="$t('client maximum')"
            placeholder="..."
        />
    </section>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    setup() {

    },
})
</script>
