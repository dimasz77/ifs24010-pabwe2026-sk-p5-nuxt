<template>
  <div>
    <label :for="inputId" class="field-label">
      {{ label }}
      <span v-if="required" class="text-red-700" aria-hidden="true">*</span>
    </label>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    inputId: string;
    label: string;
    required?: boolean;
  }>(),
  { required: false }
);
</script>
