<template>
    <div v-click-outside="toggleMenu.bind(this)" class="c-user-context">
        <Icon class="icon icon-small" name="Menu" @click="toggleMenu" />
        <div v-if="visible" class="actions">
            <button class="action">
                <Icon class="icon icon-mini" name="Mic" /> Mute user
            </button>
            <button class="action">
                <Icon class="icon icon-mini" name="Operator" />Make Operator
            </button>
            <button class="action">
                <Icon class="icon icon-mini" name="Present" />Make presenter
            </button>
        </div>
    </div>
</template>
<script>


export default {
    data() {
        return {
            visible: false,
        }
    },
    methods: {
        toggleMenu(e, forceState) {
            // The v-click-outside
            if (typeof forceState === 'object') {
                this.visible = false
                return
            }
            this.visible = !this.visible
        },
    },
}
</script>

<style lang="postcss">
.c-user-context {
    display: flex;
    margin-left: calc(var(--spacer) * 2);
    position: relative;

    & .icon:hover {
        cursor: pointer;
    }

    & .actions {
        background: var(--grey-400);
        border: 1px solid var(--grey-300);
        /* margin-top: 50px; */
        margin-left: calc(var(--spacer) * 4);
        position: absolute;
        z-index: 10;

        & button {
            background: none;
            color: var(--grey-200);
            padding: calc(var(--spacer) / 2) var(--spacer);
            text-align: left;
            user-select: none;
            width: 200px;


            &:hover {
                cursor: pointer;
            }
        }
    }

}
</style>
