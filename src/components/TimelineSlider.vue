<script setup lang="ts">
import { type CountryCode } from "@/types"

const START_YEAR = 1950
const END_YEAR = 2024

const props = defineProps<{
  activeCountryCode: CountryCode | undefined
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
  <Transition
    enter-active-class="transition-slide-fade duration-slide-fade-in ease-slide-fade-in"
    leave-active-class="transition-slide-fade duration-slide-fade-out ease-slide-fade-out"
    enter-from-class="translate-y-5 opacity-0"
    leave-to-class="translate-y-5 opacity-0"
  >
    <div
      v-show="activeCountryCode"
      class="w-full max-w-96 h-20 absolute bottom-4 left-1/2 -translate-x-1/2 px-4 select-none flex flex-col"
    >
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
  </Transition>
</template>
