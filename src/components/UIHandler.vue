<script setup lang="ts">
import type { CountryCode, PopulationData } from "@/types"
import { onMounted } from "vue"

const START_YEAR = 1950
const END_YEAR = 2024
const year = defineModel({ default: 2000 })
defineProps<{
  activeCountryCode: CountryCode | ""
}>()
let populationData: PopulationData | undefined = undefined

async function loadPopulationData() {
  const loadedPopulationData = (await import("@/assets/populationData.json")) as PopulationData

  populationData = loadedPopulationData
}

onMounted(() => {
  loadPopulationData()
})
</script>

<template>
  <div class="w-full absolute bottom-0 select-none">
    <div class="flex justify-between">
      <span>{{ START_YEAR }}</span>
      <span>{{ year }}</span>
      <span>{{ END_YEAR }}</span>
    </div>
    <div>
      <input type="range" :min="START_YEAR" :max="END_YEAR" v-model="year" class="w-full" />
    </div>
  </div>
</template>
