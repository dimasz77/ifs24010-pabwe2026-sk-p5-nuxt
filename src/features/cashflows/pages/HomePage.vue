<template>
  <div class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Ringkasan Arus Kas</h1>
        <p class="mt-1 text-sm text-slate-600">Pantau pemasukan, pengeluaran, dan saldo dari seluruh sumber dana Anda.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button type="button" data-testid="reset-all-btn" class="btn-secondary" @click="handleResetAll">
          <Trash2 :size="18" aria-hidden="true" />
          <span>Reset Semua</span>
        </button>
        <button type="button" data-testid="open-add-modal-btn" class="btn-primary" @click="showAdd = true">
          <Plus :size="18" :stroke-width="2.5" aria-hidden="true" />
          <span>Tambah Transaksi</span>
        </button>
      </div>
    </div>

    <section aria-labelledby="summary-title">
      <h2 id="summary-title" class="sr-only">Ringkasan saldo</h2>
      <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="metric in metrics" :key="metric.key" :data-testid="`metric-${metric.key}`" class="card p-5">
          <dt class="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <component :is="metric.icon" :size="18" :class="metric.tone" aria-hidden="true" />
            {{ metric.label }}
          </dt>
          <dd class="mt-2 text-2xl font-extrabold text-slate-900">{{ formatRupiah(metric.value) }}</dd>
        </div>
      </dl>
    </section>

    <section class="card p-4 sm:p-5" aria-labelledby="filter-title">
      <h2 id="filter-title" class="mb-4 text-base font-bold text-slate-900">Filter Transaksi</h2>
      <form class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" @submit.prevent="applyFilters">
        <FormField input-id="filter-type" label="Jenis">
          <select id="filter-type" v-model="filters.type" data-testid="filter-type" class="field-input">
            <option value="">Semua</option>
            <option v-for="(text, value) in CASH_FLOW_TYPE_LABELS" :key="value" :value="value">{{ text }}</option>
          </select>
        </FormField>
        <FormField input-id="filter-source" label="Sumber Dana">
          <select id="filter-source" v-model="filters.source" data-testid="filter-source" class="field-input">
            <option value="">Semua</option>
            <option v-for="(text, value) in CASH_FLOW_SOURCE_LABELS" :key="value" :value="value">{{ text }}</option>
          </select>
        </FormField>
        <FormField input-id="filter-label" label="Label">
          <select id="filter-label" v-model="filters.label" data-testid="filter-label" class="field-input">
            <option value="">Semua</option>
            <option v-for="item in cashFlowsStore.labels" :key="item" :value="item">{{ item }}</option>
          </select>
        </FormField>
        <FormField input-id="filter-start-date" label="Tanggal Awal">
          <input id="filter-start-date" v-model="filters.start_date" type="date" data-testid="filter-start-date" class="field-input" />
        </FormField>
        <FormField input-id="filter-end-date" label="Tanggal Akhir">
          <input id="filter-end-date" v-model="filters.end_date" type="date" data-testid="filter-end-date" class="field-input" />
        </FormField>
        <div class="flex gap-3 sm:col-span-2 lg:col-span-5">
          <button type="submit" data-testid="apply-filter-btn" class="btn-primary">
            <Filter :size="18" aria-hidden="true" />
            <span>Terapkan Filter</span>
          </button>
          <button type="button" data-testid="reset-filter-btn" class="btn-secondary" @click="resetFilters">Atur Ulang</button>
        </div>
      </form>
    </section>

    <section class="card overflow-hidden" aria-labelledby="transactions-title">
      <h2 id="transactions-title" class="border-b border-slate-100 p-4 text-base font-bold text-slate-900 sm:p-5">
        Daftar Transaksi
      </h2>

      <output v-if="cashFlowsStore.isCashFlowsLoading" class="block py-16 text-center text-slate-700">
        <Loader2 :size="36" class="mx-auto mb-2 animate-spin text-indigo-700" aria-hidden="true" />
        <p class="font-medium">Memuat data arus kas...</p>
      </output>

      <p v-else-if="cashFlowsStore.cashFlows.length === 0" class="py-12 text-center font-medium text-slate-700" data-testid="empty-state">
        Belum ada catatan arus kas yang sesuai.
      </p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <caption class="sr-only">Daftar catatan arus kas</caption>
          <thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-700">
            <tr>
              <th scope="col" class="px-5 py-3">Tanggal</th>
              <th scope="col" class="px-5 py-3">Label</th>
              <th scope="col" class="px-5 py-3">Jenis</th>
              <th scope="col" class="px-5 py-3">Sumber</th>
              <th scope="col" class="px-5 py-3 text-right">Nominal</th>
              <th scope="col" class="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in cashFlowsStore.cashFlows" :key="item.id" :data-testid="`cashflow-row-${item.id}`">
              <td class="whitespace-nowrap px-5 py-3 text-slate-700">{{ formatDate(item.created_at) }}</td>
              <td class="px-5 py-3 font-semibold text-slate-900">{{ item.label }}</td>
              <td class="px-5 py-3">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="item.type === 'inflow' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                >
                  {{ CASH_FLOW_TYPE_LABELS[item.type] }}
                </span>
              </td>
              <td class="px-5 py-3 text-slate-700">{{ CASH_FLOW_SOURCE_LABELS[item.source] }}</td>
              <td
                class="whitespace-nowrap px-5 py-3 text-right font-bold"
                :class="item.type === 'inflow' ? 'text-emerald-700' : 'text-red-700'"
              >
                {{ formatRupiah(item.nominal) }}
              </td>
              <td class="px-5 py-3">
                <div class="flex justify-end gap-1">
                  <RouterLink
                    :to="`/cash-flows/${item.id}`"
                    :data-testid="`detail-btn-${item.id}`"
                    :aria-label="`Lihat detail ${item.label}`"
                    class="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
                  >
                    <Eye :size="18" aria-hidden="true" />
                  </RouterLink>
                  <button
                    type="button"
                    :data-testid="`edit-btn-${item.id}`"
                    :aria-label="`Ubah ${item.label}`"
                    class="rounded-lg p-2 text-indigo-800 hover:bg-indigo-50"
                    @click="editing = item"
                  >
                    <Pencil :size="18" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    :data-testid="`delete-btn-${item.id}`"
                    :aria-label="`Hapus ${item.label}`"
                    class="rounded-lg p-2 text-red-700 hover:bg-red-50"
                    @click="handleDelete(item)"
                  >
                    <Trash2 :size="18" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AddModal v-if="showAdd" @close="showAdd = false" @saved="refreshAll" />
    <ChangeModal v-if="editing" :cash-flow="editing" @close="editing = null" @saved="refreshAll" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Eye,
  Filter,
  Landmark,
  Loader2,
  Pencil,
  PiggyBank,
  Plus,
  Scale,
  Trash2,
} from "lucide-vue-next";
import FormField from "../../common/components/FormField.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { CASH_FLOW_SOURCE_LABELS, CASH_FLOW_TYPE_LABELS } from "../constants";
import type { CashFlow, CashFlowQueryParams } from "../api/cashFlowApi";
import { formatDate, formatRupiah, showConfirmDialog } from "../../../helpers/toolsHelper";

const cashFlowsStore = useCashFlowsStore();

const AddModal = defineAsyncComponent(() => import("../modals/AddModal.vue"));
const ChangeModal = defineAsyncComponent(() => import("../modals/ChangeModal.vue"));
const showAdd = ref(false);
const editing = ref<CashFlow | null>(null);

const filters = reactive<CashFlowQueryParams>({
  type: "",
  source: "",
  label: "",
  start_date: "",
  end_date: "",
});

const metrics = computed(() => {
  const { stats } = cashFlowsStore;
  return [
    { key: "balance", label: "Total Saldo Kas Bersih", value: stats.total_inflow - stats.total_outflow, icon: Scale, tone: "text-indigo-700" },
    { key: "inflow", label: "Total Pemasukan", value: stats.total_inflow, icon: ArrowUpCircle, tone: "text-emerald-700" },
    { key: "outflow", label: "Total Pengeluaran", value: stats.total_outflow, icon: ArrowDownCircle, tone: "text-red-700" },
    { key: "cash", label: "Saldo Kas Tunai", value: stats.cash, icon: Banknote, tone: "text-slate-700" },
    { key: "savings", label: "Saldo Rekening Tabungan", value: stats.savings, icon: PiggyBank, tone: "text-slate-700" },
    { key: "loans", label: "Saldo Pinjaman", value: stats.loans, icon: Landmark, tone: "text-slate-700" },
  ];
});

async function refreshAll(): Promise<void> {
  await Promise.all([cashFlowsStore.asyncRefreshCashFlows(), cashFlowsStore.asyncSetLabels()]);
}

async function applyFilters(): Promise<void> {
  await cashFlowsStore.asyncSetCashFlows({ ...filters });
}

async function resetFilters(): Promise<void> {
  Object.assign(filters, { type: "", source: "", label: "", start_date: "", end_date: "" });
  await cashFlowsStore.asyncSetCashFlows({});
}

async function handleDelete(item: CashFlow): Promise<void> {
  const result = await showConfirmDialog(`Hapus catatan "${item.label}"?`);
  if (!result.isConfirmed) {
    return;
  }

  await cashFlowsStore.asyncDeleteCashFlow(item.id);
  cashFlowsStore.setIsCashFlowDelete(false);
  if (cashFlowsStore.isCashFlowDeleted) {
    cashFlowsStore.setIsCashFlowDeleted(false);
    await refreshAll();
  }
}

async function handleResetAll(): Promise<void> {
  const result = await showConfirmDialog("Reset seluruh catatan arus kas? Tindakan ini tidak dapat dibatalkan.");
  if (!result.isConfirmed) {
    return;
  }

  await cashFlowsStore.asyncDeleteAllCashFlows();
  cashFlowsStore.setIsCashFlowDeleteAll(false);
  if (cashFlowsStore.isCashFlowDeletedAll) {
    cashFlowsStore.setIsCashFlowDeletedAll(false);
    await refreshAll();
  }
}

onMounted(refreshAll);
</script>
