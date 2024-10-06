<script setup lang="ts">
import EarthTerrain from "@/components/EarthTerrain.vue"
import Stats from "stats.js"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { onMounted, onUnmounted, ref } from "vue"

const container = ref()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
const controls = new OrbitControls(camera, renderer.domElement)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(5, 10, 7)
scene.add(directionalLight)

var stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

camera.position.set(11, 11, 11)
camera.lookAt(0, 0, 0)

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)
  stats.begin()
  controls.update()
  renderer.render(scene, camera)
  stats.end()
}

onMounted(() => {
  container.value.appendChild(renderer.domElement)
  window.addEventListener("resize", onWindowResize)
  animate()
})

onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize)
})
</script>

<template>
  <div class="w-full min-h-svh" ref="container">
    <EarthTerrain :scene="scene" :camera="camera" />
  </div>
</template>
