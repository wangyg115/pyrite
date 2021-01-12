<template>
    <svg
        class="icon" height="40"
        viewBox="0 0 24 24"
        width="40"
    >
        <component :is="name" />
    </svg>
</template>

<script>
import IconEye from './IconEye.vue'
import IconGroups from './IconGroups.vue'
import IconLogout from './IconLogout.vue'
import IconMute from './IconMute.vue'
import IconUser from './IconUser.vue'
import IconUserUnknown from './IconUserUnknown.vue'
import IconScreenShare from './IconScreenShare.vue'
import IconStopScreenShare from './IconStopScreenShare.vue'

export default {
  components: {
      eye: IconEye,
      groups: IconGroups,
      logout: IconLogout,
      mute: IconMute,
      screenshare: IconScreenShare,
      stopScreenshare: IconStopScreenShare,
      user: IconUser,
      userUnknown: IconUserUnknown
  },
  props: {
    name: {
        required: true,
        type: String
    }
  }
}
</script>
