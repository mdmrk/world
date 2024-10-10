<script setup lang="ts">
import { type Tab } from "@/types"
import { ref } from "vue"

const activeTab = ref<Tab>("Chart")
</script>

<template>
  <slot v-if="activeTab === 'Chart'"></slot>
</template>
