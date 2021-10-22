<template>
    <div class="c-header">
        <header>
            <RouterLink
                class="logo tooltip"
                :class="{active: $route.name && $route.name.includes('manager')}"
                :data-tooltip="$route.name.includes('conference-') ? $t('switch to manager') : $t('switch to conference')"
                :to="toggleAdminConference"
            >
                <Icon class="icon" name="Logo" />PYRITE
            </RouterLink>

            <div class="version">
                {{ version }}
            </div>
        </header>
        <slot />
    </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    computed: {
        toggleAdminConference() {
            if (this.$route.name === 'conference-splash') {
                return {name: 'admin-groups'}
            } else if (this.$route.name === 'conference-groups-connected') {
                return {name: 'admin-users'}
            } else if (this.$route.name === 'conference-groups-disconnected') {
                // Mirror the selected group to the admin groups.
                const groupId = this.$route.params.groupId
                return {name: 'admin-groups-group', params: {groupId, tabId: 'misc'}}
            } else if (this.$route.name === 'admin-groups-group') {
                const groupId = this.$route.params.groupId
                if (!this.$s.group.connected) {
                    return {name: 'conference-groups-disconnected', params: {groupId}}
                } else {
                    return {name: 'conference-groups-connected', params: {groupId}}
                }
            }
            return {name: 'conference-main'}
        },
    },
    data() {
        return {
            version: import.meta.env.VITE_VERSION,
        }
    },
    setup() {

    },
})
</script>

<style lang="scss">
.c-header {
    display: flex;
    flex-direction: column;

    header {
        align-items: center;
        display: flex;
        justify-content: space-between;

        .logo {
            align-items: center;
            color: var(--primary-color);
            display: flex;
            font-family: var(--font-secondary);
            justify-content: center;

            &.no-back-link:hover {
                cursor: not-allowed;
            }

            .icon {
                height: 50px;
                transform: scale(1.25);
                width: 50px;
            }
        }

        .version {
            font-family: var(--font-secondary);
            font-style: italic;
        }
    }

    header {
        align-items: center;
        background: var(--grey-2);
        border-bottom: var(--border) solid var(--grey-4);
        display: flex;
        font-weight: bold;
        height: var(--space-4);
        margin-bottom: var(--spacer);
        padding-right: var(--spacer);
        position: relative;

        .logo {

            svg {
                color: var(--primary-color);
                margin-right: var(--spacer);
            }

        }

        .version {
            bottom: 0;
            font-size: var(--text-small);
            position: absolute;
            right: calc(var(--spacer) * 1.75);
        }
    }
}
</style>
