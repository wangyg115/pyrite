<template>
    <path :class="{'icon-chat-unread-path': iconProps.unread > 0}" d="M12,3C6.5,3 2,6.58 2,11C2.05,13.15 3.06,15.17 4.75,16.5C4.75,17.1 4.33,18.67 2,21C4.37,20.89 6.64,20 8.47,18.5C9.61,18.83 10.81,19 12,19C17.5,19 22,15.42 22,11C22,6.58 17.5,3 12,3M12,17C7.58,17 4,14.31 4,11C4,7.69 7.58,5 12,5C16.42,5 20,7.69 20,11C20,14.31 16.42,17 12,17Z" />
    <text
        v-if="iconProps.unread > 0"
        class="icon-chat-unread-text"
        dominant-baseline="middle" text-anchor="middle"
        x="50%"
        y="50%"
    >
        {{ iconProps.unread }}
    </text>
</template>

<script>
export default {
    props: {
        iconProps: {
            default() {return {unread: 0}},
            required: false,
            type: Object,
        },
    },
}
</script>

<style lang="scss">
.icon-chat-unread-path {
    color: var(--grey-50);
}

.icon-chat-unread-text {
    color: var(--grey-50);
    font: 600 9px sans-serif;
}
</style>

