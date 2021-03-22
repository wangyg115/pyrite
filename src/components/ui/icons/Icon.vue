<template>
    <svg
        class="icon"
        height="40"
        viewBox="0 0 24 24"
        width="40"
    >
        <component :is="`Icon${name}`" />
    </svg>
</template>

<script>
import IconChat from './IconChat.vue'
import IconChatClose from './IconChatClose.vue'
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
import IconMic from './IconMic.vue'
import IconMicMute from './IconMicMute.vue'
import IconOperator from './IconOperator.vue'
import IconPip from './IconPip.vue'
import IconPlayFile from './IconPlayFile.vue'
import IconPresent from './IconPresent.vue'
import IconScreenShare from './IconScreenShare.vue'
import IconSend from './IconSend.vue'
import IconSettings from './IconSettings.vue'
import IconSettingsMisc from './IconSettingsMisc.vue'
import IconStopScreenShare from './IconStopScreenShare.vue'
import IconUser from './IconUser.vue'
import IconUserUnknown from './IconUserUnknown.vue'
import IconWarning from './IconWarning.vue'
import IconWebcam from './IconWebcam.vue'

export default {
    components: {
        IconChat,
        IconChatClose,
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
        IconMic,
        IconMicMute,
        IconOperator,
        IconPip,
        IconPlayFile,
        IconPresent,
        IconScreenShare,
        IconSend,
        IconSettings,
        IconSettingsMisc,
        IconStopScreenShare,
        IconUser,
        IconUserUnknown,
        IconWarning,
        IconWebcam,
    },
    props: {
        name: {
            required: true,
            type: String,
        },
    },
}
</script>

<style lang="postcss">
.icon {
    fill: currentColor;
    height: 40px;
    width: 40px;

    &.icon-tiny {
        height: calc(var(--space-1) / 2);
        width: calc(var(--space-1) / 2);
    }

    &.icon-mini {
        height: var(--space-1);
        width: var(--space-1);
    }

    &.icon-small {
        height: var(--space-2);
        width: var(--space-2);
    }

    &.icon-large {
        height: 50px;
        width: 50px;
    }
}
</style>
