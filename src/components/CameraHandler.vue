<script setup lang="ts">
import { OrbitControls } from "@tresjs/cientos"
import { useTresContext } from "@tresjs/core"

const { camera } = useTresContext()
</script>

<template>
  <TresPerspectiveCamera :position="[11, 11, 11]" />
  <OrbitControls :enablePan="false" />
</template>
