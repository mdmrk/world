<script setup lang="ts">
const START_YEAR = 1950
const END_YEAR = 2024

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void
}>()

const updateValue = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  emit("update:modelValue", value)
}
</script>
<template>
  <div class="w-full h-24 absolute bottom-0 select-none pb-4 px-4 flex flex-col">
    <div class="flex justify-between px-2 text-2xl">
      <div>{{ START_YEAR }}</div>
      <div>{{ END_YEAR }}</div>
    </div>
    <input
      id="timeline"
      type="range"
      :min="START_YEAR"
      :max="END_YEAR"
      :value="props.modelValue"
      @input="updateValue"
    />
  </div>
</template>
