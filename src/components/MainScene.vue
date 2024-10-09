<script setup lang="ts">
import EarthOcean from "@/components/EarthOcean.vue"
import EarthTerrain from "@/components/EarthTerrain.vue"
import type { CountryCode } from "@/types"
import Stats from "stats.js"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { onMounted, onUnmounted, ref } from "vue"

const emit = defineEmits<{
  (e: "setActiveCountryCode", countryCode: CountryCode | undefined): void
}>()
const container = ref()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(11, 11, 11)
camera.lookAt(0, 0, 0)
offsetCameraToUi()
const renderer = new THREE.WebGLRenderer()
renderer.setAnimationLoop(animate)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor("#181818")
const composer = new EffectComposer(renderer)
composer.setSize(window.innerWidth, window.innerHeight)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)
const outputPass = new OutputPass()
composer.addPass(outputPass)
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.enablePan = false
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(5, 10, 7)
scene.add(directionalLight)

var stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

function offsetCameraToUi() {
  const width = window.innerWidth
  const height = window.innerHeight
  const uiHeight = 96 - 28
  const offsetY = width > 900 ? height * (uiHeight / height / 2) : -height / 4
  const offsetX = width > 900 ? width / 8 : 0
  camera.aspect = width / height
  camera.setViewOffset(width, height, offsetX, offsetY, width, height)
}

function setActiveCountryCode(countryCode: CountryCode | undefined) {
  emit("setActiveCountryCode", countryCode)
}

function onWindowResize() {
  const width = window.innerWidth
  const height = window.innerHeight
  offsetCameraToUi()
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  composer.setSize(width, height)
}

function animate() {
  stats.begin()
  controls.update()
  composer.render()
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
  <div class="w-full h-full" ref="container">
    <EarthTerrain
      @set-active-country-code="setActiveCountryCode"
      :scene="scene"
      :camera="camera"
      :renderer="renderer"
      :composer="composer"
    />
    <EarthOcean :scene="scene" />
  </div>
</template>
