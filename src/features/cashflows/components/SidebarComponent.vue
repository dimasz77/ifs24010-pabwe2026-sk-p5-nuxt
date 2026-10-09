<template>
  <div>
    <div
      v-if="isSidebarOpen"
      data-testid="sidebar-backdrop"
      aria-hidden="true"
      class="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
      @click="emit('close-mobile')"
    />

    <aside
      id="sidebar-navigation"
      aria-label="Menu samping"
      class="fixed bottom-0 left-0 top-16 z-30 w-64 border-r border-slate-200 bg-white p-4 transition-transform duration-200 ease-in-out md:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-full flex-col justify-between">
        <nav aria-label="Navigasi utama">
          <p class="px-3 text-xs font-bold uppercase tracking-wider text-slate-600">Menu Utama</p>
          <ul class="mt-3 space-y-1">
            <li v-for="item in navItems" :key="item.to">
              <RouterLink
                :to="item.to"
                :aria-current="isActive(item) ? 'page' : undefined"
                class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                :class="isActive(item) ? 'bg-indigo-700 font-semibold text-white shadow-md shadow-indigo-700/25' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'"
                @click="emit('close-mobile')"
              >
                <component :is="item.icon" :size="20" aria-hidden="true" />
                <span>{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </nav>

        <p class="rounded-2xl border border-indigo-100 bg-indigo-50 p-3 text-xs font-semibold text-indigo-900">
          Praktikum 5 PABWE
        </p>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import { LayoutDashboard, Users, UserCircle } from "lucide-vue-next";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  prefixes: string[];
}

defineProps<{
  isSidebarOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close-mobile"): void;
}>();

const route = useRoute();

const navItems: NavItem[] = [
  { to: "/", label: "Ringkasan Arus Kas", icon: LayoutDashboard, prefixes: ["/", "/cash-flows"] },
  { to: "/users", label: "Direktori Pengguna", icon: Users, prefixes: ["/users"] },
  { to: "/profile", label: "Profil Saya", icon: UserCircle, prefixes: ["/profile"] },
];

function isActive(item: NavItem): boolean {
  return item.prefixes.some((prefix) => route.path === prefix || route.path.startsWith(`${prefix}/`));
}
</script>
