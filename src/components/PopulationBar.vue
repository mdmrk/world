<script setup lang="ts">
const props = defineProps<{
  width: string
  alignRight: boolean
}>()
</script>

<template>
  <div class="w-full">
    <div
      class="bg-light h-4 md:h-5 min-w-1 transition-all duration-500"
      :class="`${alignRight ? 'ml-auto rounded-l-full' : 'rounded-r-full'}`"
      :style="{ width: props.width }"
    >
      &nbsp;
    </div>
  </div>
</template>
