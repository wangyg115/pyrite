<template>
    <section class="c-tab-group-access tab-content active">
        <FieldCheckbox
            v-model="$s.manager.group.public"
            help="When enabled, the group becomes visible on the landing page"
            label="Public"
        />
        <FieldCheckbox
            v-model="$s.manager.group['allow-subgroups']"
            help="When enabled, subgroups of the form group/subgroup are automatically created when first accessed"
            label="SubGroups"
        />
        <FieldCheckbox
            v-model="$s.manager.group.autolock"
            help="The group will start locked and become locked whenever there are no clients with operator privileges"
            label="Autolock"
        />
        <FieldCheckbox
            v-model="$s.manager.group.autokick"
            help="All clients will be kicked out whenever there are no clients with operator privileges; this is not recommended, prefer the autolock option instead"
            label="Autokick"
        />

        <!-- <FieldText
            v-model.number="$s.manager.group['max-clients']"
            help="The maximum number of clients that may join the group at a time"
            label="Maximum clients"
            placeholder="..."
        /> -->
        <!--
        <FieldText
            v-model="$s.manager.group.presenter"
            help="the users allowed to connect with presenter privileges"
            label="Group Presenters"
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
