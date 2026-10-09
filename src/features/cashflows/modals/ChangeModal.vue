<template>
  <ModalDialog title="Ubah Catatan Arus Kas" test-id="change-cashflow-modal" @close="emit('close')">
    <CashFlowForm
      :initial="cashFlow"
      id-prefix="change"
      submit-label="Simpan Perubahan"
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
import type { CashFlow, CashFlowPayload } from "../api/cashFlowApi";

const props = defineProps<{
  cashFlow: CashFlow;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const cashFlowsStore = useCashFlowsStore();
const loading = ref(false);

async function handleSave(payload: CashFlowPayload): Promise<void> {
  loading.value = true;
  await cashFlowsStore.asyncChangeCashFlow(props.cashFlow.id, payload);
  cashFlowsStore.setIsCashFlowChange(false);
  loading.value = false;

  if (cashFlowsStore.isCashFlowChanged) {
    cashFlowsStore.setIsCashFlowChanged(false);
    emit("saved");
    emit("close");
  }
}
</script>
