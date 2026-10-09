<template>
  <div v-if="profile" class="mx-auto max-w-4xl space-y-8">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Profil Akun</h1>
      <p class="mt-1 text-sm text-slate-600">Kelola identitas, foto profil, dan keamanan akun Anda.</p>
    </div>

    <section class="card flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8" aria-labelledby="profile-name-title">
      <div class="relative">
        <img
          v-if="profile.photo"
          :src="secureUrl(profile.photo)"
          :alt="`Foto ${profile.name}`"
          width="96"
          height="96"
          decoding="async"
          referrerpolicy="no-referrer"
          class="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-indigo-100"
        />
        <div
          v-else
          aria-hidden="true"
          class="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-700 text-3xl font-bold text-white shadow-md"
        >
          {{ profile.name.charAt(0).toUpperCase() }}
        </div>

        <label
          for="profile-photo-file-input"
          data-testid="upload-profile-photo-btn"
          class="absolute bottom-0 right-0 rounded-full bg-indigo-700 p-2 text-white shadow-md hover:bg-indigo-800"
        >
          <span class="sr-only">Ubah foto profil</span>
          <Loader2 v-if="loadingPhoto" :size="16" class="animate-spin" aria-hidden="true" />
          <Camera v-else :size="16" aria-hidden="true" />
        </label>
        <input
          id="profile-photo-file-input"
          type="file"
          data-testid="profile-photo-file-input"
          accept="image/*"
          class="sr-only"
          @change="handlePhotoUpload"
        />
      </div>

      <div class="space-y-1 text-center sm:text-left">
        <h2 id="profile-name-title" class="text-xl font-bold text-slate-900">{{ profile.name }}</h2>
        <p class="text-sm text-slate-600">{{ profile.email }}</p>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section class="card space-y-5 p-6 sm:p-8" aria-labelledby="profile-form-title">
        <div class="flex items-center gap-2.5 border-b border-slate-100 pb-2">
          <UserIcon :size="18" class="text-indigo-700" aria-hidden="true" />
          <h2 id="profile-form-title" class="font-bold text-slate-900">Ubah Biodata</h2>
        </div>

        <form class="space-y-4" @submit.prevent="handleUpdateProfile">
          <FormField input-id="profile-name-input" label="Nama Lengkap" required>
            <input id="profile-name-input" v-model="name" type="text" autocomplete="name" data-testid="profile-name-input" class="field-input" required />
          </FormField>
          <FormField input-id="profile-email-input" label="Alamat Email" required>
            <input id="profile-email-input" v-model="email" type="email" autocomplete="email" data-testid="profile-email-input" class="field-input" required />
          </FormField>
          <button type="submit" data-testid="submit-profile-btn" :disabled="loadingProfile" class="btn-primary w-full">
            {{ loadingProfile ? "Menyimpan Perubahan..." : "Simpan Perubahan" }}
          </button>
        </form>
      </section>

      <section class="card space-y-5 p-6 sm:p-8" aria-labelledby="password-form-title">
        <div class="flex items-center gap-2.5 border-b border-slate-100 pb-2">
          <ShieldCheck :size="18" class="text-amber-700" aria-hidden="true" />
          <h2 id="password-form-title" class="font-bold text-slate-900">Keamanan &amp; Kata Sandi</h2>
        </div>

        <form class="space-y-4" @submit.prevent="handleUpdatePassword">
          <FormField input-id="current-password-input" label="Kata Sandi Saat Ini" required>
            <input id="current-password-input" v-model="oldPassword" type="password" autocomplete="current-password" data-testid="current-password-input" class="field-input" required />
          </FormField>
          <FormField input-id="new-password-input" label="Kata Sandi Baru" required>
            <input id="new-password-input" v-model="newPassword" type="password" autocomplete="new-password" data-testid="new-password-input" placeholder="Minimal 6 karakter" class="field-input" required />
          </FormField>
          <FormField input-id="confirm-password-input" label="Ulangi Kata Sandi Baru" required>
            <input id="confirm-password-input" v-model="newPasswordConfirmation" type="password" autocomplete="new-password" data-testid="confirm-password-input" class="field-input" required />
          </FormField>
          <button type="submit" data-testid="submit-password-btn" :disabled="loadingPassword" class="btn-primary w-full">
            {{ loadingPassword ? "Memperbarui Kata Sandi..." : "Perbarui Kata Sandi" }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { User as UserIcon, Camera, Loader2, ShieldCheck } from "lucide-vue-next";
import FormField from "../../common/components/FormField.vue";
import { useUsersStore } from "../states/usersStore";
import { secureUrl, showErrorDialog } from "../../../helpers/toolsHelper";

const MAX_PHOTO_SIZE = 3 * 1024 * 1024;

const usersStore = useUsersStore();
const profile = computed(() => usersStore.profile);

const name = ref("");
const email = ref("");
const oldPassword = ref("");
const newPassword = ref("");
const newPasswordConfirmation = ref("");

const loadingProfile = ref(false);
const loadingPhoto = ref(false);
const loadingPassword = ref(false);

watch(
  profile,
  (current) => {
    if (current) {
      name.value = current.name;
      email.value = current.email;
    }
  },
  { immediate: true }
);

async function handleUpdateProfile(): Promise<void> {
  if (!name.value.trim() || !email.value.trim()) {
    void showErrorDialog("Nama dan email tidak boleh kosong");
    return;
  }

  loadingProfile.value = true;
  await usersStore.asyncPutProfile(name.value.trim(), email.value.trim());
  usersStore.setIsChangeProfile(false);
  loadingProfile.value = false;
}

async function handlePhotoUpload(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.item(0);
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    void showErrorDialog("Pilih file gambar yang valid");
    return;
  }

  if (file.size > MAX_PHOTO_SIZE) {
    void showErrorDialog("Ukuran file foto maksimal 3MB");
    return;
  }

  loadingPhoto.value = true;
  await usersStore.asyncPostProfilePhoto(file);
  usersStore.setIsChangeProfilePhoto(false);
  loadingPhoto.value = false;
}

function resetPasswordForm(): void {
  oldPassword.value = "";
  newPassword.value = "";
  newPasswordConfirmation.value = "";
}

async function handleUpdatePassword(): Promise<void> {
  if (newPassword.value.length < 6) {
    void showErrorDialog("Kata sandi baru minimal 6 karakter");
    return;
  }

  if (newPassword.value !== newPasswordConfirmation.value) {
    void showErrorDialog("Konfirmasi kata sandi tidak cocok");
    return;
  }

  loadingPassword.value = true;
  await usersStore.asyncPutProfilePassword(
    oldPassword.value,
    newPassword.value,
    newPasswordConfirmation.value
  );

  if (usersStore.isChangeProfilePassword) {
    usersStore.setIsChangeProfilePassword(false);
    resetPasswordForm();
  }
  loadingPassword.value = false;
}
</script>