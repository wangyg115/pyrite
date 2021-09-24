<template>
    <div class="c-header">
        <header>
            <RouterLink
                v-if="!$s.group.connected" class="logo tooltip"
                :class="{active: $route.name && $route.name.includes('manager')}"
                :data-tooltip="$route.name === 'splash' ? $t('switch to manager') : $t('switch to conference')"
                :to="$route.name === 'splash' ? {name: 'manager-groups'} : {name: 'main'}"
            >
                <Icon class="icon" name="Logo" />PYRITE
            </RouterLink>
            <div v-else class="logo no-back-link">
                <Icon class="icon" name="Logo" />PYRITE
            </div>

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

    .item {
        align-items: center;
        display: flex;
        padding: calc(var(--spacer) / 2) var(--spacer);

        .item-icon {
            align-items: center;
            color: var(--primary-color);
            display: flex;
            margin-right: var(--spacer);
        }

        .name {
            align-items: center;
            color: var(--grey-7);
            display: flex;
            flex: 1;
            font-family: var(--font-secondary);
            font-weight: 600;
            line-height: 100%;

            &.active {
                color: var(--primary-color);
            }
        }

    }
}
</style>
