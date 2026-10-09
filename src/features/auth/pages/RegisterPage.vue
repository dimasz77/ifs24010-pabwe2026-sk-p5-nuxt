<template>
  <form class="space-y-4" @submit.prevent="onSubmitHandler">
    <FormField id="register-name-input" label="Nama Lengkap" required>
      <input
        id="register-name-input"
        v-model="name"
        type="text"
        autocomplete="name"
        data-testid="register-name-input"
        placeholder="Nama lengkap Anda"
        class="field-input"
        required
      />
    </FormField>

    <FormField id="register-email-input" label="Alamat Email" required>
      <input
        id="register-email-input"
        v-model="email"
        type="email"
        autocomplete="email"
        data-testid="register-email-input"
        placeholder="nama@email.com"
        class="field-input"
        required
      />
    </FormField>

    <FormField id="register-password-input" label="Kata Sandi" required>
      <input
        id="register-password-input"
        v-model="password"
        type="password"
        autocomplete="new-password"
        data-testid="register-password-input"
        placeholder="Minimal 6 karakter"
        class="field-input"
        minlength="6"
        required
      />
    </FormField>

    <FormField id="register-confirm-input" label="Ulangi Kata Sandi" required>
      <input
        id="register-confirm-input"
        v-model="confirmPassword"
        type="password"
        autocomplete="new-password"
        data-testid="register-confirm-input"
        placeholder="Ulangi kata sandi"
        class="field-input"
        required
      />
    </FormField>

    <div class="pt-2">
      <button
        id="register-submit-button"
        type="submit"
        data-testid="register-submit-button"
        :disabled="loading"
        class="btn-primary w-full"
      >
        <template v-if="loading">
          <Loader2 :size="18" class="animate-spin" aria-hidden="true" />
          <span>Mendaftarkan...</span>
        </template>
        <template v-else>
          <UserPlus :size="18" :stroke-width="2.5" aria-hidden="true" />
          <span>Daftar Sekarang</span>
        </template>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Loader2, UserPlus } from "lucide-vue-next";
import FormField from "../../common/components/FormField.vue";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);

async function onSubmitHandler(): Promise<void> {
  if (password.value !== confirmPassword.value) {
    void showErrorDialog("Konfirmasi kata sandi tidak cocok");
    return;
  }

  loading.value = true;
  await authStore.asyncSetIsAuthRegister(name.value.trim(), email.value.trim(), password.value);
  authStore.setIsAuthRegister(false);

  if (authStore.isAuthRegistered) {
    authStore.setIsAuthRegistered(false);
    await router.push("/auth/login");
  }
  loading.value = false;
}
</script>
