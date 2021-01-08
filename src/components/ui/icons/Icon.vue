<template>
    <svg
        class="icon" height="40"
        viewBox="0 0 25 25"
        width="40"
    >
        <component :is="name" />
    </svg>
</template>

<script>
import IconGroups from './IconGroups.vue'
import IconMute from './IconMute.vue'
import IconUser from './IconUser.vue'
import IconUserUnknown from './IconUserUnknown.vue'
import IconScreenShare from './IconScreenShare.vue'
import IconStopScreenShare from './IconStopScreenShare.vue'

export default {
  components: {
      groups: IconGroups,
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
