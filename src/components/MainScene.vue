<script setup lang="ts">
import EarthOcean from "@/components/EarthOcean.vue"
import EarthTerrain from "@/components/EarthTerrain.vue"
import Stars from "@/components/Stars.vue"
import { initialCameraLookAt, initialCameraPosition } from "@/consts"
import type { CountryCode } from "@/types"
import { isDev } from "@/utils"
import CameraControls from "camera-controls"
import gsap from "gsap"
import Stats from "stats.js"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
import { onMounted, onUnmounted, ref, shallowRef } from "vue"

CameraControls.install({ THREE: THREE })

const emit = defineEmits<{
  (e: "setActiveCountryCode", countryCode: CountryCode | undefined): void
}>()

const container = ref<HTMLElement>()
const offsetX = ref(0)
const offsetY = ref(0)
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
const composer = new EffectComposer(renderer)
const cameraControls = shallowRef<CameraControls>()

let previousTime = 0
const stats = new Stats()

function initScene() {
  if (cameraControls.value) {
    cameraControls.value.setLookAt(
      initialCameraPosition.x,
      initialCameraPosition.y,
      initialCameraPosition.z,
      initialCameraLookAt.x,
      initialCameraLookAt.y,
      initialCameraLookAt.z,
      false
    )
  }

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor("#000000")

  composer.setSize(window.innerWidth, window.innerHeight)

  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)

  const outputPass = new OutputPass()
  composer.addPass(outputPass)

  if (isDev()) {
    stats.showPanel(0)
    document.body.appendChild(stats.dom)
  }
}

function initCameraControls() {
  cameraControls.value = new CameraControls(camera, renderer.domElement)
  cameraControls.value.dollyToCursor = false
  cameraControls.value.draggingDampingFactor = 0.1
  cameraControls.value.smoothTime = 0.25
  cameraControls.value.verticalDragToForward = false
  cameraControls.value.minDistance = 10
  cameraControls.value.maxDistance = 70
  cameraControls.value.minPolarAngle = 0
  cameraControls.value.maxPolarAngle = Math.PI
  cameraControls.value.truckSpeed = 0
  cameraControls.value.mouseButtons.wheel = CameraControls.ACTION.DOLLY
  cameraControls.value.setLookAt(
    initialCameraPosition.x,
    initialCameraPosition.y,
    initialCameraPosition.z,
    initialCameraLookAt.x,
    initialCameraLookAt.y,
    initialCameraLookAt.z,
    true
  )
}

function setActiveCountryCode(countryCode: CountryCode | undefined) {
  emit("setActiveCountryCode", countryCode)
  const chartW = window.innerWidth < 768 ? 0 : 414 + 32
  const timelineH = window.innerWidth < 768 ? 80 - 32 - 550 : 80 - 32 + 16
  const targetOffsetX = countryCode === undefined ? 0 : chartW / 2
  const targetOffsetY = countryCode === undefined ? 0 : timelineH / 2
  tweenOffsets(targetOffsetX, targetOffsetY)
}

function offsetCamera() {
  const width = window.innerWidth
  const height = window.innerHeight
  camera.setViewOffset(width, height, offsetX.value, offsetY.value, width, height)
}

function updateOffsetX(value: number) {
  offsetX.value = value
  offsetCamera()
}

function updateOffsetY(value: number) {
  offsetY.value = value
  offsetCamera()
}

function tweenOffsets(targetOffsetX: number, targetOffsetY: number) {
  gsap.to(offsetX, {
    value: targetOffsetX,
    duration: 1,
    ease: "power1.out",
    onUpdate: () => updateOffsetX(offsetX.value)
  })
  gsap.to(offsetY, {
    value: targetOffsetY,
    duration: 1,
    ease: "power1.out",
    onUpdate: () => updateOffsetY(offsetY.value)
  })
}

function updateFXAAUniforms() {
  const pixelRatio = renderer.getPixelRatio()
  const fxaaPass = composer.passes.find(
    (pass) => pass instanceof ShaderPass && pass.material.uniforms["resolution"]
  ) as ShaderPass
  if (fxaaPass) {
    fxaaPass.material.uniforms["resolution"].value.x = 1 / (window.innerWidth * pixelRatio)
    fxaaPass.material.uniforms["resolution"].value.y = 1 / (window.innerHeight * pixelRatio)
  }
}

function onWindowResize() {
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  composer.setSize(width, height)
  cameraControls.value?.updateCameraUp()
  updateFXAAUniforms()
  offsetCamera()
}

function animate(currentTime: number) {
  if (isDev()) {
    stats.begin()
  }

  if (cameraControls.value) {
    const delta = (currentTime - previousTime) / 1000
    cameraControls.value.update(delta)
  }

  composer.render()

  if (isDev()) {
    stats.end()
  }

  previousTime = currentTime
  requestAnimationFrame(animate)
}

onMounted(() => {
  if (container.value) {
    initCameraControls()
    initScene()
    container.value.appendChild(renderer.domElement)
    window.addEventListener("resize", onWindowResize)
    previousTime = performance.now()
    offsetCamera()
    requestAnimationFrame(animate)
  }
})

onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize)
  cameraControls.value?.dispose()
  if (isDev()) {
    stats.dom.remove()
  }
})
</script>

<template>
  <div class="w-svh h-svh overflow-hidden" ref="container">
    <Stars :scene="scene" />
    <EarthTerrain
      @set-active-country-code="setActiveCountryCode"
      :scene="scene"
      :camera="camera"
      :renderer="renderer"
      :composer="composer"
      :cameraControls="cameraControls"
    />
    <EarthOcean :scene="scene" :camera="camera" />
  </div>
</template>
