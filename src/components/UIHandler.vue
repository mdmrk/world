<script setup lang="ts">
import type { CountryCode, PopulationData } from "@/types"
import { onMounted } from "vue"

const START_YEAR = 1950
const END_YEAR = 2024
const year = defineModel({ default: 2000 })
const props = defineProps<{
  activeCountryCode: CountryCode | undefined
}>()
let populationData: PopulationData | undefined = undefined

async function loadPopulationData() {
  const loadedPopulationData = (await import("@/assets/populationData.json")) as PopulationData

  populationData = loadedPopulationData
}

function yearMarkers() {
  const markers = []

  for (let y = START_YEAR; y <= END_YEAR; y += 5) {
    markers.push(y)
  }
  return markers
}

onMounted(() => {
  loadPopulationData()
})
</script>

<template>
  <div class="w-full h-24 absolute bottom-0 select-none pb-4 px-4 flex flex-col">
    <div class="flex justify-between px-2 text-lg">
      <div>
        {{ START_YEAR }}
      </div>

      <div>
        {{ END_YEAR }}
      </div>
    </div>
    <input
      id="timeline"
      type="range"
      :min="START_YEAR"
      :max="END_YEAR"
      v-model="year"
      list="markers"
    />
    <datalist id="markers">
      <option
        v-for="markerYear in yearMarkers"
        :key="markerYear"
        :value="markerYear"
        :label="markerYear"
      ></option>
    </datalist>
  </div>
</template>
