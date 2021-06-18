<template>
    <svg
        class="icon"
        height="40"
        viewBox="0 0 24 24"
        width="40"
    >
        <component :is="`Icon${name}`" :icon-props="iconProps" />
    </svg>
</template>

<script>
import IconChat from './IconChat.vue'
import IconClose from './IconClose.vue'
import IconError from './IconError.vue'
import IconEye from './IconEye.vue'
import IconFullscreen from './IconFullscreen.vue'
import IconGroups from './IconGroups.vue'
import IconHeadset from './IconHeadset.vue'
import IconInfo from './IconInfo.vue'
import IconLock from  './IconLock.vue'
import IconLogin from './IconLogin.vue'
import IconLogo from './IconLogo.vue'
import IconLogout from './IconLogout.vue'
import IconMenu from './IconMenu.vue'
import IconMessage from './IconMessage.vue'
import IconMic from './IconMic.vue'
import IconMicMute from './IconMicMute.vue'
import IconOperator from './IconOperator.vue'
import IconPip from './IconPip.vue'
import IconPlayFile from './IconPlayFile.vue'
import IconPresent from './IconPresent.vue'
import IconRecord from './IconRecord.vue'
import IconRefresh from './IconRefresh.vue'
import IconScreenShare from './IconScreenShare.vue'
import IconSend from './IconSend.vue'
import IconSettings from './IconSettings.vue'
import IconSettingsMisc from './IconSettingsMisc.vue'
import IconSpinner from './IconSpinner.vue'
import IconStopScreenShare from './IconStopScreenShare.vue'
import IconUser from './IconUser.vue'
import IconUserUnknown from './IconUserUnknown.vue'
import IconWarning from './IconWarning.vue'
import IconWebcam from './IconWebcam.vue'

export default {
    components: {
        IconChat,
        IconClose,
        IconError,
        IconEye,
        IconFullscreen,
        IconGroups,
        IconHeadset,
        IconInfo,
        IconLock,
        IconLogin,
        IconLogo,
        IconLogout,
        IconMenu,
        IconMessage,
        IconMic,
        IconMicMute,
        IconOperator,
        IconPip,
        IconPlayFile,
        IconPresent,
        IconRecord,
        IconRefresh,
        IconScreenShare,
        IconSend,
        IconSettings,
        IconSettingsMisc,
        IconSpinner,
        IconStopScreenShare,
        IconUser,
        IconUserUnknown,
        IconWarning,
        IconWebcam,
    },
    props: {
        iconProps: {
            default() {return {}},
            required: false,
            type: Object,
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

    &.icon-tiny {
        height: calc(var(--spacer) * 1.75);
        width: calc(var(--spacer) * 1.75);
    }

    &.icon-mini {
        height: calc(var(--spacer) * 2.75);
        width: calc(var(--spacer) * 2.75);
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
