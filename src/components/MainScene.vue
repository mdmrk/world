<script setup lang="ts">
import EarthTerrain from "@/components/EarthTerrain.vue"
import Stats from "stats.js"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js"
import { onMounted, onUnmounted, ref } from "vue"

const container = ref()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setAnimationLoop(animate)
renderer.setSize(window.innerWidth, window.innerHeight)
const composer = new EffectComposer(renderer)
composer.setSize(window.innerWidth, window.innerHeight)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)
const effectFXAA = new ShaderPass(FXAAShader)
effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)
composer.addPass(effectFXAA)
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

camera.position.set(11, 11, 11)
camera.lookAt(0, 0, 0)

function onWindowResize() {
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  composer.setSize(width, height)
  effectFXAA.uniforms.resolution.value.set(1 / width, 1 / height)
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
    <EarthTerrain :scene="scene" :camera="camera" :renderer="renderer" :composer="composer" />
  </div>
</template>
