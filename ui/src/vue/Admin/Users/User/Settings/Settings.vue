<template>
    <div v-if="$s.admin.user" class="c-admin-user content">
        <header>
            <div class="notice" />
            <div class="title">
                <span>{{ $s.admin.user.name }}</span>
                <Icon class="icon icon-regular" name="User" />
            </div>
        </header>

        <ul class="tabs">
            <RouterLink
                active-class="active-group"
                class="btn btn-menu tab tooltip"
                :class="{active: tabId === 'misc'}"
                :data-tooltip="$t('miscellaneous')"
                :to="routeSettings('misc')"
            >
                <Icon class="icon-small" name="SettingsMisc" />
            </RouterLink>
            <RouterLink
                active-class="active-group"
                class="btn btn-menu tab tooltip"
                :class="{active: tabId === 'op'}"
                :data-tooltip="$t('operator permission')"
                :to="routeSettings('op')"
            >
                <Icon class="icon-small" name="Operator" />
            </RouterLink>
            <RouterLink
                active-class="active-group"
                class="btn btn-menu tab tooltip"
                :class="{active: tabId === 'presenter'}"
                :data-tooltip="$t('presenter permission')"
                :to="routeSettings('presenter')"
            >
                <Icon class="icon-small" name="Present" />
            </RouterLink>
            <RouterLink
                active-class="active-group"
                class="btn btn-menu tab tooltip"
                :class="{active: tabId === 'other'}"
                :data-tooltip="$t('passive permission')"
                :to="routeSettings('other')"
            >
                <Icon class="icon-small" name="OtherPermissions" />
            </RouterLink>
        </ul>

        <div class="tabs-content">
            <TabMisc v-if="tabId === 'misc'" />
            <TabPermissions v-else-if="tabId === 'op'" category="op" />
            <TabPermissions v-else-if="tabId === 'presenter'" category="presenter" />
            <TabPermissions v-else-if="tabId === 'other'" category="other" />

            <div class="actions">
                <button
                    class="btn btn-menu tooltip tooltip-left"
                    :data-tooltip="$t('save user')"
                    @click="saveUser"
                >
                    <Icon class="icon-small" name="Save" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue'
import TabMisc from './TabMisc.vue'
import TabPermissions from './TabPermissions.vue'

export default defineComponent({
    components: {TabMisc, TabPermissions},
    computed: {
        tabId() {
            return this.$route.query.tab || 'misc'
        },
    },
    methods: {
        routeSettings(tabId) {
            return {
                params: {userId: this.$s.admin.user.id},
                query: {tab: tabId},
                to: 'admin-users-settings',
            }
        },
        async saveUser() {
            await this.$m.user.saveUser(this.userId, this.$s.admin.user)
        },
    },
})
</script>
