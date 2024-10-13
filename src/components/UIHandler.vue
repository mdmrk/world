<script setup lang="ts">
import FloatingMenu from "@/components/FloatingMenu.vue"
import GithubIcon from "@/components/GithubIcon.vue"
import PopulationChart from "@/components/PopulationChart.vue"
import TimelineSlider from "@/components/TimelineSlider.vue"

import { type CountryCode, type PopulationData } from "@/types"
import { onMounted, reactive, ref } from "vue"

let populationData = reactive<PopulationData>({} as PopulationData)
const year = ref(2000)

const props = defineProps<{
  activeCountryCode: CountryCode | undefined
}>()

function updateYear(newYear: number) {
  year.value = newYear
}

async function loadPopulationData() {
  const loadedPopulationData = (await import("@/assets/populationData.json")) as PopulationData
  populationData = loadedPopulationData
}

onMounted(() => {
  loadPopulationData()
})
</script>

<template>
  <GithubIcon />
  <FloatingMenu>
    <PopulationChart
      :active-country-code="activeCountryCode"
      :population-data="populationData"
      :year="year"
    />
  </FloatingMenu>
  <TimelineSlider :modelValue="year" @update:modelValue="updateYear" />
</template>
