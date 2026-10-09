<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <RouterLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-indigo-800 hover:underline" data-testid="back-link">
      <ArrowLeft :size="16" aria-hidden="true" />
      Kembali ke ringkasan
    </RouterLink>

    <div v-if="loading" class="py-24 text-center text-slate-700">
      <h1 class="sr-only">Detail Transaksi</h1>
      <div role="status">
        <Loader2 :size="36" class="mx-auto mb-2 animate-spin text-indigo-700" aria-hidden="true" />
        <p class="font-medium">Memuat detail transaksi...</p>
      </div>
    </div>

    <div v-else-if="!cashFlow" class="card p-8 text-center" data-testid="not-found-state">
      <h1 class="text-xl font-bold text-slate-900">Transaksi Tidak Ditemukan</h1>
      <p class="mt-2 text-sm text-slate-600">Catatan arus kas yang Anda cari tidak tersedia atau sudah dihapus.</p>
    </div>

    <template v-else>
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Detail Transaksi</h1>
          <p class="mt-1 text-sm text-slate-600">Rincian lengkap catatan arus kas.</p>
        </div>
        <div class="flex gap-3">
          <button type="button" data-testid="detail-edit-btn" class="btn-secondary" @click="showChange = true">
            <Pencil :size="18" aria-hidden="true" />
            <span>Ubah</span>
          </button>
          <button type="button" data-testid="detail-delete-btn" class="btn-danger" @click="handleDelete">
            <Trash2 :size="18" aria-hidden="true" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      <section class="card p-6 sm:p-8" aria-labelledby="detail-label-title">
        <h2 id="detail-label-title" class="text-xl font-bold text-slate-900">{{ cashFlow.label }}</h2>
        <p
          class="mt-1 text-3xl font-extrabold"
          :class="cashFlow.type === 'inflow' ? 'text-emerald-700' : 'text-red-700'"
          data-testid="detail-nominal"
        >
          {{ formatRupiah(cashFlow.nominal) }}
        </p>

        <dl class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div v-for="row in buildRows(cashFlow)" :key="row.label">
            <dt class="text-xs font-bold uppercase tracking-wider text-slate-700">{{ row.label }}</dt>
            <dd class="mt-1 text-sm text-slate-900">{{ row.value }}</dd>
          </div>
        </dl>
      </section>

      <ChangeModal v-if="showChange" :cash-flow="cashFlow" @close="showChange = false" @saved="loadDetail" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-vue-next";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { CASH_FLOW_SOURCE_LABELS, CASH_FLOW_TYPE_LABELS } from "../constants";
import type { CashFlow } from "../api/cashFlowApi";
import { formatDate, formatRupiah, showConfirmDialog } from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const cashFlowsStore = useCashFlowsStore();

const loading = ref(true);
const showChange = ref(false);

const cashFlowId = computed(() => String(route.params.cashFlowId));
const cashFlow = computed(() => cashFlowsStore.cashFlow);

function buildRows(current: CashFlow): { label: string; value: string }[] {
  return [
    { label: "Jenis Arus Kas", value: CASH_FLOW_TYPE_LABELS[current.type] },
    { label: "Sumber Dana", value: CASH_FLOW_SOURCE_LABELS[current.source] },
    { label: "Label Kategori", value: current.label },
    { label: "Keterangan", value: current.description || "-" },
    { label: "Dibuat Pada", value: formatDate(current.created_at) },
    { label: "Diperbarui Pada", value: formatDate(current.updated_at) },
  ];
}

async function loadDetail(): Promise<void> {
  await cashFlowsStore.asyncSetCashFlow(cashFlowId.value);
}

async function handleDelete(): Promise<void> {
  const result = await showConfirmDialog("Hapus catatan arus kas ini?");
  if (!result.isConfirmed) {
    return;
  }

  await cashFlowsStore.asyncDeleteCashFlow(cashFlowId.value);
  cashFlowsStore.setIsCashFlowDelete(false);
  if (cashFlowsStore.isCashFlowDeleted) {
    cashFlowsStore.setIsCashFlowDeleted(false);
    await router.push("/");
  }
}

onMounted(async () => {
  cashFlowsStore.setCashFlow(null);
  await loadDetail();
  loading.value = false;
});
</script>
