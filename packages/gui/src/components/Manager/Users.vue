<template>
    <div class="c-manager-users content">
        <div class="panels">
            <section>
                <div class="table">
                    <div class="header">
                        <div class="cell">
                            Username
                        </div>
                        <div class="cell">
                            Password
                        </div>
                    </div>
                    <div
                        v-for="(user, index) in $s.manager.users" :key="index"
                        class="row"
                        :class="{selected: index === selectedRow}"
                        @click.stop="selectRow(index)"
                    >
                        <form class="cell">
                            <FieldText
                                v-model="user.name"
                                autocomplete=""
                                name="username"
                                :readonly="index !== selectedRow"
                                @focus="focusInput(index)"
                            />
                        </form>
                        <form class="cell">
                            <FieldText
                                v-model="user.password"
                                autocomplete=""
                                name="password"
                                :readonly="index !== selectedRow"
                                type="password"
                            />
                        </form>
                    </div>
                </div>
            </section>
            <div class="actions">
                <button
                    class="btn btn-menu tooltip tooltip-left"
                    :data-tooltip="$t('save users')"
                    @click="saveUsers"
                >
                    <Icon class="icon-small" name="Save" />
                </button>
                <button
                    class="btn btn-menu tooltip tooltip-left"
                    :data-tooltip="$t('save users')"
                    :disabled="selectedRow === null"
                    @click="removeUser"
                >
                    <Icon class="icon-small" name="Minus" />
                </button>
                <button
                    class="btn btn-menu tooltip tooltip-left"
                    :data-tooltip="$t('save users')"
                    @click="addUser"
                >
                    <Icon class="icon-small" name="Plus" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    data() {
        return {
            selectedRow: null,
        }
    },
    methods: {
        addUser() {
            this.$s.manager.users.push({name: '', password: ''})
        },
        focusInput(indexRow) {
            if (indexRow === this.selectedRow) return
            this.selectedRow = indexRow
        },
        async loadUsers() {
            const res = await fetch('/api/users')
            this.$s.manager.users = await res.json()
        },
        removeUser() {
            this.$s.manager.users.splice(this.selectedRow, 1)
            this.selectedRow = null
        },
        async saveUsers() {
            console.log("SAVE USERS")
            const res = await fetch(`/api/users/`, {
                body: JSON.stringify(this.$s.manager.users),
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            })
        },
        selectRow(selectedRow) {
            if (this.selectedRow === selectedRow) {
                this.selectedRow = null
            } else {
                this.selectedRow = selectedRow
            }
        },
    },
    mounted() {
        this.loadUsers()
    },
})
</script>
