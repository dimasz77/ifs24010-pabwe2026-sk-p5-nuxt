<template>
  <main v-if="!usersStore.profile" class="flex min-h-screen items-center justify-center bg-slate-50">
    <div class="flex flex-col items-center gap-3" role="status">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-indigo-700 border-t-transparent" aria-hidden="true" />
      <p class="text-sm font-medium text-slate-700">Memuat sesi pengguna...</p>
    </div>
  </main>

  <div v-else class="min-h-screen bg-slate-50 text-slate-800">
    <NavbarComponent
      :profile="usersStore.profile"
      :is-sidebar-open="isSidebarOpen"
      @logout="handleLogout"
      @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
    />

    <SidebarComponent :is-sidebar-open="isSidebarOpen" @close-mobile="isSidebarOpen = false" />

    <main class="pt-16 md:pl-64">
      <div class="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { RouterView, useRouter } from "vue-router";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { useUsersStore } from "../../users/states/usersStore";
import { useAuthStore } from "../../auth/states/authStore";
import apiHelper from "../../../helpers/apiHelper";

const router = useRouter();
const usersStore = useUsersStore();
const authStore = useAuthStore();

const isSidebarOpen = ref(false);

onMounted(() => {
  if (apiHelper.getAccessToken()) {
    void usersStore.asyncSetProfile();
  } else {
    void router.push("/auth/login");
  }
});

// Setelah pengambilan profil selesai tanpa hasil, sesi dianggap tidak valid.
watch(
  () => usersStore.isProfile,
  (isProfile) => {
    if (isProfile) {
      usersStore.setIsProfile(false);
      if (!usersStore.profile) {
        apiHelper.putAccessToken(null);
        void router.push("/auth/login");
      }
    }
  }
);

watch(
  () => authStore.isAuthLogout,
  (isAuthLogout) => {
    if (isAuthLogout) {
      authStore.setIsAuthLogout(false);
      usersStore.setProfile(null);
      void router.push("/auth/login");
    }
  }
);

function handleLogout(): void {
  void authStore.asyncSetIsAuthLogout();
}
</script>
