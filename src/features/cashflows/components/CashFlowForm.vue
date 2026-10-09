<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField :id="`${idPrefix}-type`" label="Jenis Arus Kas" required>
        <select :id="`${idPrefix}-type`" v-model="type" :data-testid="`${idPrefix}-type-select`" class="field-input">
          <option v-for="(text, value) in CASH_FLOW_TYPE_LABELS" :key="value" :value="value">{{ text }}</option>
        </select>
      </FormField>

      <FormField :id="`${idPrefix}-source`" label="Sumber Dana" required>
        <select :id="`${idPrefix}-source`" v-model="source" :data-testid="`${idPrefix}-source-select`" class="field-input">
          <option v-for="(text, value) in CASH_FLOW_SOURCE_LABELS" :key="value" :value="value">{{ text }}</option>
        </select>
      </FormField>
    </div>

    <FormField :id="`${idPrefix}-label`" label="Label Kategori" required>
      <input
        :id="`${idPrefix}-label`"
        v-model="label"
        type="text"
        :list="`${idPrefix}-label-options`"
        :data-testid="`${idPrefix}-label-input`"
        placeholder="Contoh: Gaji, Makan, Transportasi"
        class="field-input"
        required
      />
      <datalist :id="`${idPrefix}-label-options`">
        <option v-for="item in cashFlowsStore.labels" :key="item" :value="item" />
      </datalist>
    </FormField>

    <FormField :id="`${idPrefix}-nominal`" label="Nominal (Rupiah)" required>
      <input
        :id="`${idPrefix}-nominal`"
        v-model="nominal"
        type="number"
        min="1"
        step="1"
        inputmode="numeric"
        :data-testid="`${idPrefix}-nominal-input`"
        placeholder="Contoh: 50000"
        class="field-input"
        required
      />
    </FormField>

    <FormField :id="`${idPrefix}-description`" label="Keterangan">
      <textarea
        :id="`${idPrefix}-description`"
        v-model="description"
        rows="3"
        :data-testid="`${idPrefix}-description-input`"
        placeholder="Catatan tambahan (opsional)"
        class="field-input"
      />
    </FormField>

    <div class="flex items-center justify-end gap-3 pt-2">
      <button type="button" :data-testid="`${idPrefix}-cancel-btn`" :disabled="loading" class="btn-secondary" @click="emit('cancel')">
        Batal
      </button>
      <button type="submit" :data-testid="`${idPrefix}-submit-btn`" :disabled="loading" class="btn-primary">
        {{ loading ? "Menyimpan..." : submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FormField from "../../common/components/FormField.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { CASH_FLOW_SOURCE_LABELS, CASH_FLOW_TYPE_LABELS } from "../constants";
import type { CashFlowPayload, CashFlowSource, CashFlowType } from "../api/cashFlowApi";

const props = defineProps<{
  initial: CashFlowPayload;
  idPrefix: string;
  submitLabel: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", payload: CashFlowPayload): void;
  (e: "cancel"): void;
}>();

const cashFlowsStore = useCashFlowsStore();

const type = ref<CashFlowType>(props.initial.type);
const source = ref<CashFlowSource>(props.initial.source);
const label = ref(props.initial.label);
const nominal = ref(String(props.initial.nominal));
const description = ref(props.initial.description);

function handleSubmit(): void {
  const nominalValue = Number(nominal.value);

  if (!label.value.trim()) {
    void showErrorDialog("Label kategori tidak boleh kosong");
    return;
  }

  if (Number.isNaN(nominalValue) || nominalValue <= 0) {
    void showErrorDialog("Nominal harus berupa angka lebih dari 0");
    return;
  }

  emit("submit", {
    type: type.value,
    source: source.value,
    label: label.value.trim(),
    nominal: nominalValue,
    description: description.value.trim(),
  });
}
</script>
