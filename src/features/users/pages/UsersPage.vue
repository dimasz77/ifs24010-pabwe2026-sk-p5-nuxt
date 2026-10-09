<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Direktori Pengguna</h1>
      <p class="mt-1 text-sm text-slate-600">Daftar seluruh akun pengguna yang terdaftar di dalam sistem.</p>
    </div>

    <section class="card overflow-hidden" aria-labelledby="users-list-title">
      <h2 id="users-list-title" class="sr-only">Daftar pengguna</h2>
      <div class="flex items-center justify-between gap-4 border-b border-slate-100 p-4 sm:p-5">
        <div class="relative max-w-md flex-1">
          <Search :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label for="search-user-input" class="sr-only">Cari pengguna</label>
          <input
            id="search-user-input"
            v-model="search"
            type="search"
            data-testid="search-user-input"
            placeholder="Cari berdasarkan nama atau email..."
            class="field-input pl-10"
          />
        </div>
        <p class="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700" data-testid="users-total">
          Total: {{ filteredUsers.length }} Pengguna
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
        <output v-if="loading" class="col-span-full py-16 text-center text-slate-600">
          <Loader2 :size="36" class="mx-auto mb-2 animate-spin text-indigo-700" aria-hidden="true" />
          <p class="font-medium">Memuat daftar pengguna...</p>
        </output>
        <div v-else-if="filteredUsers.length === 0" class="col-span-full py-12 text-center text-slate-600">
          <Users :size="40" class="mx-auto mb-2 text-slate-500" aria-hidden="true" />
          <p class="font-medium">Tidak ada data pengguna ditemukan.</p>
        </div>
        <template v-else>
          <article
            v-for="user in filteredUsers"
            :key="user.id"
            :data-testid="`user-card-${user.id}`"
            class="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md"
          >
            <div class="flex items-start gap-3.5">
              <img
                v-if="user.photo"
                :src="secureUrl(user.photo)"
                :alt="`Foto ${user.name}`"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                class="h-12 w-12 shrink-0 rounded-full border border-slate-200 object-cover"
              />
              <div
                v-else
                aria-hidden="true"
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-700 text-base font-bold text-white"
              >
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="truncate font-bold text-slate-900">{{ user.name }}</h3>
                <p class="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-600">
                  <Mail :size="14" class="shrink-0" aria-hidden="true" />
                  <span class="truncate">{{ user.email }}</span>
                </p>
              </div>
            </div>
            <p class="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <Calendar :size="13" aria-hidden="true" />
              <span>{{ formatDate(user.created_at) }}</span>
            </p>
          </article>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Users, Search, Mail, Calendar, Loader2 } from "lucide-vue-next";
import { useUsersStore } from "../states/usersStore";
import { formatDate, secureUrl } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();

const loading = ref(false);
const search = ref("");

const filteredUsers = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  return usersStore.users.filter(
    (user) =>
      user.name.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword)
  );
});

onMounted(async () => {
  loading.value = true;
  await usersStore.asyncSetUsers();
  loading.value = false;
});
</script>