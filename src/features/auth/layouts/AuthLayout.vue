<template>
  <main class="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 py-12 sm:px-6 lg:px-8">
    <div class="text-center sm:mx-auto sm:w-full sm:max-w-md">
      <div class="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-700 text-white shadow-xl shadow-indigo-500/25">
        <WalletCards :size="32" :stroke-width="2.5" aria-hidden="true" />
      </div>
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Delcom Cash Flow</h1>
      <p class="mt-1 text-sm text-slate-600">Catat dan pantau arus kas Anda dengan mudah</p>
    </div>

    <div class="mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-md sm:px-0">
      <div class="rounded-3xl border border-slate-100 bg-white px-6 py-8 shadow-xl shadow-slate-200/50 sm:px-10">
        <nav aria-label="Autentikasi" class="mb-6 flex rounded-2xl bg-slate-100 p-1">
          <RouterLink
            to="/auth/login"
            class="flex-1 rounded-xl py-2 text-center text-sm font-semibold transition-all"
            :class="isLoginActive ? 'bg-white text-indigo-800 shadow-xs' : 'text-slate-700 hover:text-slate-900'"
          >
            Masuk Akun
          </RouterLink>
          <RouterLink
            to="/auth/register"
            class="flex-1 rounded-xl py-2 text-center text-sm font-semibold transition-all"
            :class="isLoginActive ? 'text-slate-700 hover:text-slate-900' : 'bg-white text-indigo-800 shadow-xs'"
          >
            Daftar Baru
          </RouterLink>
        </nav>

        <RouterView />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter, RouterLink, RouterView } from "vue-router";
import { WalletCards } from "lucide-vue-next";
import { useUsersStore } from "../../users/states/usersStore";
import apiHelper from "../../../helpers/apiHelper";

const route = useRoute();
const router = useRouter();
const usersStore = useUsersStore();

const isLoginActive = computed(() => route.path === "/auth/login");

onMounted(async () => {
  if (apiHelper.getAccessToken()) {
    await usersStore.asyncSetProfile();
  }
});

watch(
  () => usersStore.isProfile,
  async (isProfile) => {
    if (isProfile) {
      usersStore.setIsProfile(false);
      if (usersStore.profile) {
        await router.push("/");
      }
    }
  }
);
</script>
