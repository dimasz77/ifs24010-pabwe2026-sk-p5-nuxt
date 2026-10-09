<template>
  <header class="fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
    <div class="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <button
          type="button"
          data-testid="toggle-sidebar-btn"
          class="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden"
          :aria-label="isSidebarOpen ? 'Tutup navigasi' : 'Buka navigasi'"
          :aria-expanded="isSidebarOpen"
          aria-controls="sidebar-navigation"
          @click="emit('toggle-sidebar')"
        >
          <X v-if="isSidebarOpen" :size="20" aria-hidden="true" />
          <Menu v-else :size="20" aria-hidden="true" />
        </button>

        <RouterLink to="/" class="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
            <WalletCards :size="22" :stroke-width="2.5" aria-hidden="true" />
          </span>
          <span class="text-lg font-bold text-slate-900">Delcom Cash Flow</span>
        </RouterLink>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-3 rounded-full border border-slate-200 p-1.5 pr-3">
          <img
            v-if="profile.photo"
            :src="secureUrl(profile.photo)"
            :alt="`Foto ${profile.name}`"
            width="32"
            height="32"
            referrerpolicy="no-referrer"
            decoding="async"
            class="h-8 w-8 rounded-full border border-slate-200 object-cover"
          />
          <span
            v-else
            aria-hidden="true"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-xs font-bold text-white"
          >
            {{ profile.name.charAt(0).toUpperCase() }}
          </span>
          <div class="hidden flex-col text-left leading-tight sm:flex">
            <span class="text-sm font-semibold text-slate-900" data-testid="navbar-name">{{ profile.name }}</span>
            <span class="text-xs text-slate-600" data-testid="navbar-email">{{ profile.email }}</span>
          </div>
          <span class="hidden rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 lg:inline">
            Sesi aktif
          </span>
        </div>

        <button
          type="button"
          data-testid="logout-button"
          class="btn-secondary px-3 py-2"
          @click="emit('logout')"
        >
          <LogOut :size="18" aria-hidden="true" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { WalletCards, LogOut, Menu, X } from "lucide-vue-next";
import type { User } from "../../users/api/userApi";
import { secureUrl } from "../../../helpers/toolsHelper";

defineProps<{
  profile: User;
  isSidebarOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-sidebar"): void;
  (e: "logout"): void;
}>();
</script>