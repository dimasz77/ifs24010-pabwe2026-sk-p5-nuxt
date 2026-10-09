<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
    <div class="w-full max-w-md text-center">
      <div class="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-700 ring-8 ring-indigo-50/50">
        <TriangleAlert :size="40" aria-hidden="true" />
      </div>
      <h1 class="text-7xl font-black tracking-tight text-slate-900 sm:text-8xl">404</h1>
      <p class="mt-3 text-xl font-bold text-slate-800 sm:text-2xl">Halaman Tidak Ditemukan</p>
      <p class="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
        Maaf, halaman yang Anda cari tidak tersedia, telah dipindahkan, atau tidak pernah ada.
      </p>
      <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button type="button" data-testid="back-btn" class="btn-secondary w-full sm:w-auto" @click="router.go(-1)">
          <ArrowLeft :size="18" aria-hidden="true" />
          <span>Kembali</span>
        </button>
        <button type="button" data-testid="home-btn" class="btn-primary w-full sm:w-auto" @click="router.push('/')">
          <Home :size="18" aria-hidden="true" />
          <span>Ke Halaman Utama</span>
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { TriangleAlert, ArrowLeft, Home } from "lucide-vue-next";

const router = useRouter();
</script>
