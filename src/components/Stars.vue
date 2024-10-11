<script setup lang="ts">
import * as THREE from "three"
import { onBeforeUnmount, onMounted, watch, watchEffect } from "vue"

interface StarsProps {
  size?: number
  sizeAttenuation?: boolean
  transparent?: boolean
  alphaTest?: number
  count?: number
  depth?: number
  radius?: number
  alphaMap?: string | null
  scene?: THREE.Scene
  color?: string
}

const props = withDefaults(defineProps<StarsProps>(), {
  size: 0.5,
  sizeAttenuation: true,
  transparent: true,
  alphaTest: 0.01,
  alphaMap: null,
  count: 5000,
  depth: 50,
  radius: 120,
  color: "#f0f0f0"
})

let points: THREE.Points | null = null

const setStars = () => {
  const { radius, depth, count, scene } = props
  if (!scene) return

  const positions = new Float32Array(count * 3)
  const scales = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const r = radius + depth * Math.random()
    const theta = 2 * Math.PI * Math.random()
    const phi = Math.acos(1 - 2 * Math.random())

    positions[i3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = r * Math.cos(phi)

    scales[i] = Math.random()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1))

  const material = new THREE.PointsMaterial({
    color: new THREE.Color(props.color),
    size: props.size,
    sizeAttenuation: props.sizeAttenuation,
    transparent: props.transparent,
    alphaTest: props.alphaTest,
    alphaMap: props.alphaMap ? new THREE.TextureLoader().load(props.alphaMap) : null
  })

  if (points) {
    scene.remove(points)
    points.geometry.dispose()
    if (Array.isArray(points.material)) {
      points.material.forEach((mat) => mat.dispose())
    } else {
      points.material.dispose()
    }
  }

  points = new THREE.Points(geometry, material)
  scene.add(points)
}

onMounted(() => {
  if (props.scene) {
    setStars()
  }
})

watch(
  () => props.scene,
  (newScene) => {
    if (newScene) {
      setStars()
    }
  }
)

watchEffect(() => {
  if (props.scene) {
    setStars()
  }
})

onBeforeUnmount(() => {
  if (points && props.scene) {
    props.scene.remove(points)
    points.geometry.dispose()
    if (Array.isArray(points.material)) {
      points.material.forEach((mat) => mat.dispose())
    } else {
      points.material.dispose()
    }
  }
})

defineExpose({
  getPoints: () => points
})
</script>

<template></template>
