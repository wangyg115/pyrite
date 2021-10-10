<template>
    <svg
        class="icon"
        height="40"
        viewBox="0 0 24 24"
        width="40"
    >
        <component :is="`Icon${name}`" v-if="iconProps" :icon-props="iconProps" />
        <component :is="`Icon${name}`" v-else />
    </svg>
</template>

<script>
import IconAccess from './IconAccess.vue'
import IconChat from './IconChat.vue'
import IconChatRemove from './IconChatRemove.vue'
import IconClose from './IconClose.vue'
import IconDashboard from './IconDashboard.vue'
import IconError from './IconError.vue'
import IconEye from './IconEye.vue'
import IconFullscreen from './IconFullscreen.vue'
import IconGroup from './IconGroup.vue'
import IconGroupLocked from './IconGroupLocked.vue'
import IconHand from './IconHand.vue'
import IconHeadset from './IconHeadset.vue'
import IconInfo from './IconInfo.vue'
import IconLock from  './IconLock.vue'
import IconLogin from './IconLogin.vue'
import IconLogo from './IconLogo.vue'
import IconLogout from './IconLogout.vue'
import IconMegafone from './IconMegafone.vue'
import IconMenu from './IconMenu.vue'
import IconMessage from './IconMessage.vue'
import IconMic from './IconMic.vue'
import IconMicMute from './IconMicMute.vue'
import IconMinus from './IconMinus.vue'
import IconOperator from './IconOperator.vue'
import IconPip from './IconPip.vue'
import IconPlay from './IconPlay.vue'
import IconPlus from './IconPlus.vue'
import IconPresent from './IconPresent.vue'
import IconRecord from './IconRecord.vue'
import IconRefresh from './IconRefresh.vue'
import IconSave from './IconSave.vue'
import IconScreenShare from './IconScreenShare.vue'
import IconSend from './IconSend.vue'
import IconSettings from './IconSettings.vue'
import IconSettingsMisc from './IconSettingsMisc.vue'
import IconSpinner from './IconSpinner.vue'
import IconStopScreenShare from './IconStopScreenShare.vue'
import IconUnlock from './IconUnlock.vue'
import IconUser from './IconUser.vue'
import IconUserUnknown from './IconUserUnknown.vue'
import IconWarning from './IconWarning.vue'
import IconWebcam from './IconWebcam.vue'

export default {
    components: {
        IconAccess,
        IconChat,
        IconChatRemove,
        IconClose,
        IconDashboard,
        IconError,
        IconEye,
        IconFullscreen,
        IconGroup,
        IconGroupLocked,
        IconHand,
        IconHeadset,
        IconInfo,
        IconLock,
        IconLogin,
        IconLogo,
        IconLogout,
        IconMegafone,
        IconMenu,
        IconMessage,
        IconMic,
        IconMicMute,
        IconMinus,
        IconOperator,
        IconPip,
        IconPlay,
        IconPlus,
        IconPresent,
        IconRecord,
        IconRefresh,
        IconSave,
        IconScreenShare,
        IconSend,
        IconSettings,
        IconSettingsMisc,
        IconSpinner,
        IconStopScreenShare,
        IconUnlock,
        IconUser,
        IconUserUnknown,
        IconWarning,
        IconWebcam,
    },
    props: {
        iconProps: {
            default() {return false},
            required: false,
            type: [Object, Boolean],
        },
        name: {
            required: true,
            type: String,
        },
    },
}
</script>

<style lang="scss">
.icon {
    fill: currentColor;
    height: 40px;
    width: 40px;

    &.warning {
        color: var(--warning-color);
    }

    &.error {
        color: var(--error-color);
    }

    &.icon-tiny {
        height: calc(var(--spacer) * 1.75);
        width: calc(var(--spacer) * 1.75);
    }

    &.icon-mini {
        height: calc(var(--spacer) * 2.5);
        width: calc(var(--spacer) * 2.5);
    }

    &.icon-small {
        height: calc(var(--spacer) * 3.5);
        width: calc(var(--spacer) * 3.5);
    }

    &.icon-large {
        height: 50px;
        width: 50px;
    }
}
</style>
