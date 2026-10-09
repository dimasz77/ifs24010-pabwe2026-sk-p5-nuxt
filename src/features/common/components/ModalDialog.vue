<template>
  <div
    ref="dialogRef"
    :data-testid="testId"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    tabindex="-1"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 focus:outline-none"
    @keydown.esc="emit('close')"
  >
    <div class="card flex max-h-full w-full max-w-xl flex-col overflow-hidden">
      <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 :id="titleId" class="text-base font-bold text-slate-900">{{ title }}</h2>
        <button
          type="button"
          data-testid="close-modal-btn"
          aria-label="Tutup dialog"
          class="rounded-xl p-2 text-slate-600 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          @click="emit('close')"
        >
          <X :size="20" aria-hidden="true" />
        </button>
      </div>
      <div class="overflow-y-auto p-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { X } from "lucide-vue-next";

const props = defineProps<{
  title: string;
  testId: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const dialogRef = ref<HTMLElement | null>(null);
const titleId = `${props.testId}-title`;

onMounted(() => {
  document.body.style.overflow = "hidden";
  (dialogRef.value as HTMLElement).focus();
});

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>
