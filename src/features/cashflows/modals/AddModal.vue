<template>
  <ModalDialog title="Tambah Catatan Arus Kas" test-id="add-cashflow-modal" @close="emit('close')">
    <CashFlowForm
      :initial="EMPTY_PAYLOAD"
      id-prefix="add"
      submit-label="Tambah Catatan"
      :loading="loading"
      @submit="handleSave"
      @cancel="emit('close')"
    />
  </ModalDialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ModalDialog from "../../common/components/ModalDialog.vue";
import CashFlowForm from "../components/CashFlowForm.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import type { CashFlowPayload } from "../api/cashFlowApi";

const EMPTY_PAYLOAD: CashFlowPayload = {
  type: "inflow",
  source: "cash",
  label: "",
  nominal: 0,
  description: "",
};

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const cashFlowsStore = useCashFlowsStore();
const loading = ref(false);

async function handleSave(payload: CashFlowPayload): Promise<void> {
  loading.value = true;
  await cashFlowsStore.asyncAddCashFlow(payload);
  cashFlowsStore.setIsCashFlowAdd(false);
  loading.value = false;

  if (cashFlowsStore.isCashFlowAdded) {
    cashFlowsStore.setIsCashFlowAdded(false);
    emit("saved");
    emit("close");
  }
}
</script>
