<template>
  <form class="space-y-4" @submit.prevent="onSubmitHandler">
    <FormField id="login-email-input" label="Alamat Email" required>
      <input
        id="login-email-input"
        v-model="email"
        type="email"
        autocomplete="email"
        data-testid="login-email-input"
        placeholder="nama@email.com"
        class="field-input"
        required
      />
    </FormField>

    <FormField id="login-password-input" label="Kata Sandi" required>
      <input
        id="login-password-input"
        v-model="password"
        type="password"
        autocomplete="current-password"
        data-testid="login-password-input"
        placeholder="Masukkan kata sandi"
        class="field-input"
        required
      />
    </FormField>

    <div class="pt-2">
      <button
        id="login-submit-button"
        type="submit"
        data-testid="login-submit-button"
        :disabled="loading"
        class="btn-primary w-full"
      >
        <template v-if="loading">
          <Loader2 :size="18" class="animate-spin" aria-hidden="true" />
          <span>Sedang Masuk...</span>
        </template>
        <template v-else>
          <LogIn :size="18" :stroke-width="2.5" aria-hidden="true" />
          <span>Masuk Sekarang</span>
        </template>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Loader2, LogIn } from "lucide-vue-next";
import FormField from "../../common/components/FormField.vue";
import { useAuthStore } from "../states/authStore";
import { useUsersStore } from "../../users/states/usersStore";

const authStore = useAuthStore();
const usersStore = useUsersStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

async function onSubmitHandler(): Promise<void> {
  loading.value = true;
  await authStore.asyncSetIsAuthLogin(email.value, password.value);
  authStore.setIsAuthLogin(false);

  if (authStore.isAuthLoggedIn) {
    authStore.setIsAuthLoggedIn(false);
    await usersStore.asyncSetProfile();
  }
  loading.value = false;
}
</script>
