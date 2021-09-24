<template>
    <div class="c-manager-group content">
        <header>
            <div class="notice" />
            <div class="title">
                <span>{{ $route.params.groupId }}</span>
                <Icon class="icon icon-regular" :name="$s.group.locked ? 'GroupLocked' : 'Group'" />
            </div>
        </header>
        <div class="panels">
            <section>
                <form>
                    <FieldText
                        v-model="group.name"
                        label="Group Name"
                        placeholder="..."
                    />
                    <FieldText
                        v-model="group.description"
                        help="Add a short description to the group listing page"
                        label="Group Description"
                        placeholder="..."
                    />
                    <FieldText
                        v-model="group.contact"
                        help="Show contact information to a group administrator"
                        label="Group Contact"
                        placeholder="..."
                    />
                    <FieldText
                        v-model="group.comment"
                        help="Add a comment to the group login page"
                        label="Group Comment"
                        placeholder="..."
                    />
                    <FieldCheckbox
                        v-model="group.public"
                        help="When enabled, the group becomes visible on the landing page"
                        label="Public"
                    />
                    <FieldCheckbox
                        v-model="group['allow-recording']"
                        help="When enabled, recording of this group is allowed"
                        label="Recording"
                    />
                    <FieldCheckbox
                        v-model="group['allow-subgroups']"
                        help="When enabled, subgroups of the form group/subgroup are automatically created when first accessed"
                        label="SubGroups"
                    />
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
                        help="The maximum number of clients that may join the group at a time"
                        label="Maximum clients"
                        placeholder="..."
                    />
                    <FieldText
                        v-model="group['max-history-age']"
                        help="The time, in seconds, during which chat history is kept (default 14400, i.e. 4 hours)"
                        label="Keep Chat History"
                        placeholder="..."
                    />

                    <FieldText
                        v-model="group.presenter"
                        help="the users allowed to connect with presenter privileges"
                        label="Group Presenters"
                        placeholder="..."
                    />
                </form>
            </section>
            <div class="actions">
                <button
                    class="btn btn-menu tooltip tooltip-left"
                    :data-tooltip="$s.group.locked ? $t('join locked group') : $t('join group')"
                    @click="login"
                >
                    <Icon class="icon-small" name="Save" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    beforeMount() {
        this.group = app.$s.manager.groups.find((i) => i.name === this.$router.currentRoute.value.params.groupId)
    },
    data() {
        return {
            group: null,
        }
    },
})
</script>
