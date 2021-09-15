<template>
    <section class="c-dashboard-group tab-content active">
        <button class="btn btn-widget">
            <Icon class="icon icon-mini" name="Close" />
            {{ $t('back') }}
        </button>

        <button class="btn btn-widget">
            <Icon class="icon icon-mini" name="Save" />
            {{ $t('save') }}
        </button>
        <form>
            <FieldText
                v-model="group.name"
                label="Group Name"
                placeholder="..."
            />
            <FieldText
                v-model="group.description"
                label="Group Description"
                placeholder="..."
            />
            <FieldText
                v-model="group.contact"
                label="Group Contact"
                placeholder="..."
            />
            <FieldText
                v-model="group.comment"
                label="Group Comment"
                placeholder="..."
            />
            <FieldCheckbox v-model="group.public" label="Public" />
            <FieldCheckbox v-model="group['allow-recording']" label="Allow Recording" />
            <FieldCheckbox v-model="group['allow-subgroups']" label="Allow SubGroups" />
            <FieldCheckbox 
                v-model="group.autolock" 
                help="The group will start locked and become locked whenever there are no clients with operator privileges" 
                label="Autolock" 
            />
            <FieldCheckbox 
                v-model="group.autokick" 
                help="All clients will be kicked out whenever there are no clients with operator privileges; this is not recommended, prefer the autolock option instead" 
                label="Autokick" 
            />
                        
            <FieldText
                v-model="group['max-clients']"
                label="Maximum clients"
                placeholder="..."
            />
            <FieldText
                v-model="group['max-history-age']"
                label="Keep Chat History"
                placeholder="..."
            />

            <div v-for="presenter of group.presenter">
                {{ presenter }}
            </div>
            <FieldText
                v-model="group.presenter"
                :help="$t('For unlisted groups')"
                label="Group Presenters"
                placeholder="..."
            />
        </form>
    </section>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    beforeMount() {
        this.group = app.$s.manager.groups.find((i) => i.name === this.$router.currentRoute.value.params.groupid)
        console.log('GROUP', this.group)
    },
    data() {
        return {
            group: null,
        }
    },
})
</script>
