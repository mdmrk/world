<script lang="ts" setup>
import Stats from "stats.js"
import { onMounted, ref } from "vue"

const container = ref<HTMLElement | null>(null)

onMounted(() => {
  if (container.value) {
    const stats = new Stats()
    stats.showPanel(0)
    container.value.appendChild(stats.dom)

    function animate() {
      requestAnimationFrame(animate)
      stats.begin()
      stats.end()
    }

    requestAnimationFrame(animate)
  }
})
</script>

<template>
  <div ref="container"></div>
</template>
