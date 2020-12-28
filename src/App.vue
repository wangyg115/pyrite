<template>
    <Main />
    <Settings />
</template>

<script>
import Main from './components/Main.vue'
import Settings from './components/Settings.vue'

export default {
    name: 'App',
    components: {
        Main, Settings
    },
}
</script>
