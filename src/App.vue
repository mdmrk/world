<script setup lang="ts">
import MainScene from "@/components/MainScene.vue"
import UIHandler from "@/components/UIHandler.vue"
import type { CountryCode } from "@/types"
import { ref } from "vue"

const activeCountryCode = ref<CountryCode | undefined>(undefined)

function setActiveCountryCode(countryCode: CountryCode) {
  activeCountryCode.value = countryCode
}
</script>

<template>
  <header></header>
  <main class="min-h-svh">
    <MainScene @set-active-country-code="setActiveCountryCode" />
    <UIHandler :active-country-code="activeCountryCode" />
  </main>
</template>
