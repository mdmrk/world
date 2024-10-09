<script setup lang="ts">
import EarthOcean from "@/components/EarthOcean.vue"
import EarthTerrain from "@/components/EarthTerrain.vue"
import type { CountryCode } from "@/types"
import CameraControls from "camera-controls"
import Stats from "stats.js"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { onMounted, onUnmounted, ref, shallowRef } from "vue"

CameraControls.install({ THREE: THREE })

const emit = defineEmits<{
  (e: "setActiveCountryCode", countryCode: CountryCode | undefined): void
}>()
const container = ref()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(11, 21, 31)
camera.lookAt(0, 0, 0)
const cameraControls = shallowRef<CameraControls>()
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor("#181818")
const composer = new EffectComposer(renderer)
composer.setSize(window.innerWidth, window.innerHeight)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)
const outputPass = new OutputPass()
composer.addPass(outputPass)

let previousTime = 0
var stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

function setActiveCountryCode(countryCode: CountryCode | undefined) {
  emit("setActiveCountryCode", countryCode)
}

function onWindowResize() {
  const width = window.innerWidth
  const height = window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  composer.setSize(width, height)
  cameraControls.value?.updateCameraUp()
}

function animate(currentTime: number) {
  stats.begin()

  if (cameraControls.value) {
    const delta = (currentTime - previousTime) / 1000
    cameraControls.value.update(delta)
  }

  composer.render()
  stats.end()

  previousTime = currentTime
  requestAnimationFrame(animate)
}

onMounted(() => {
  container.value.appendChild(renderer.domElement)
  window.addEventListener("resize", onWindowResize)

  cameraControls.value = new CameraControls(camera, renderer.domElement)
  cameraControls.value.dollyToCursor = false
  cameraControls.value.draggingDampingFactor = 0.1
  cameraControls.value.smoothTime = 0.25
  cameraControls.value.verticalDragToForward = false
  cameraControls.value.minDistance = 5
  cameraControls.value.maxDistance = 50
  cameraControls.value.minPolarAngle = 0
  cameraControls.value.maxPolarAngle = Math.PI
  cameraControls.value.truckSpeed = 2.0
  cameraControls.value.mouseButtons.wheel = CameraControls.ACTION.ZOOM
  cameraControls.value.setLookAt(11, 21, 31, 0, 0, 0, true)

  previousTime = performance.now()
  requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize)
  cameraControls.value?.dispose()
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
      :cameraControls="cameraControls"
    />
    <EarthOcean :scene="scene" />
  </div>
</template>
