<template>
    <section class="c-admin-group-tab-misc tab-content active">
        <FieldText
            v-model="$s.admin.user.name"
            :label="$t('Username')"
            placeholder="..."
        />
        <FieldText
            v-model="$s.admin.user.password"
            :label="$t('Password')"
            placeholder="..."
        />
        <FieldCheckbox
            v-model="$s.admin.user.admin"
            :help="$t('Grants Pyrite admin privileges')"
            :label="$t('Admin')"
        />
    </section>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    setup() {

    },
})
</script>

<style lang="scss">
.c-admin-group-tab-misc {

    .read-only {

        span {
            color: var(--grey-9);
            font-family: var(--font-secondary);
        }
    }
}
</style>
