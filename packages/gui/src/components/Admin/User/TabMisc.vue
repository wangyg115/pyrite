<template>
    <section class="c-admin-group-tab-misc tab-content active">
        <div class="read-only">
            <span>Id</span><br> {{ $s.admin.user.id }}
        </div>
        <FieldText
            v-model="$s.admin.user.name"
            label="Username"
            placeholder="..."
        />
        <FieldText
            v-model="$s.admin.user.password"
            label="User Password"
            placeholder="..."
        />
        <FieldCheckbox
            v-model="$s.admin.user.admin"
            help="Grants Pyrite admin privileges"
            label="Admin"
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
