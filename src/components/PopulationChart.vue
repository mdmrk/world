<script setup lang="ts">
import PopulationBar from "@/components/PopulationBar.vue"
import { type CountryCode, type PopulationData, CountryList } from "@/types"
import { nFormatter } from "@/utils"
import { computed } from "vue"

const props = defineProps<{
  activeCountryCode: CountryCode | undefined
  populationData: PopulationData
  year: number
}>()
const START_YEAR = 1950
const yearIndex = computed(() => props.year - START_YEAR)

const maxGenderValue = computed(() => {
  if (!props.activeCountryCode || !props.populationData[props.activeCountryCode]) return 0
  return Math.max(
    ...props.populationData[props.activeCountryCode][yearIndex.value].flatMap(
      (ageGroup: number[]) => ageGroup
    )
  )
})

const yearTotalPopulation = computed(() => {
  if (!props.activeCountryCode || !props.populationData[props.activeCountryCode]) return 0
  return Intl.NumberFormat().format(
    props.populationData[props.activeCountryCode][yearIndex.value].reduce((sum, pair) => {
      return sum + pair[0] + pair[1]
    }, 0)
  )
})

const yearByAgeGroupPopulation = computed(() => {
  if (!props.activeCountryCode || !props.populationData[props.activeCountryCode]) return []
  return props.populationData[props.activeCountryCode][yearIndex.value]
})
</script>
<template>
  <div
    v-if="activeCountryCode"
    class="text-lg z-10 w-full md:w-auto h-auto absolute top-0 right-0 md:fixed md:top-8 md:right-8 md:max-h-[calc(100vh-10rem)] select-none py-4 px-4 flex flex-col bg-dark bg-opacity-25 md:bg-opacity-75 md:border border-dark md:rounded-xl items-center overflow-hidden"
  >
    <div
      :class="`fi-${activeCountryCode.toLowerCase()}`"
      class="transition-all duration-500 fib fi text-[12rem] absolute top-0 right-0 transparent-gradient border-1 border-transparent md:rounded-tr-xl"
    ></div>
    <div class="text-center z-10 py-2">
      <div class="text-2xl">{{ CountryList[activeCountryCode] }} ({{ year }})</div>
      <div class="text-3xl z-10">
        {{ yearTotalPopulation }}
      </div>
    </div>
    <div
      class="grid grid-cols-population-mobile md:grid-cols-population items-center z-10 w-full text-sm md:text-lg"
    >
      <div class="text-left">Males</div>
      <div>&nbsp;</div>
      <div class="text-center">Age</div>
      <div>&nbsp;</div>
      <div class="text-right">Females</div>
    </div>
    <div class="overflow-y-auto flex-grow">
      <div
        class="grid grid-cols-population-mobile md:grid-cols-population items-center z-10 w-full text-sm md:text-lg overflow-y-hidden"
        v-for="(ageGroup, index) in yearByAgeGroupPopulation"
      >
        <div class="text-left">
          {{ nFormatter(ageGroup[0]) }}
        </div>
        <PopulationBar :align-right="true" :width="`${(ageGroup[0] / maxGenderValue) * 100}%`" />
        <div class="text-center text-sm">
          {{ index === 20 ? "100+" : index * 5 + "-" + (index * 5 + 4) }}
        </div>
        <PopulationBar :align-right="false" :width="`${(ageGroup[1] / maxGenderValue) * 100}%`" />
        <div class="text-right">
          {{ nFormatter(ageGroup[1]) }}
        </div>
      </div>
    </div>
  </div>
</template>
