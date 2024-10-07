<script lang="ts" setup>
import type { CountryCode } from "@/types"
import * as THREE from "three"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js"
import { onMounted, ref, shallowRef } from "vue"

const { scene, camera, renderer, composer } = defineProps<{
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  composer: EffectComposer
}>()
const loader = new FBXLoader()
const world = ref<THREE.Object3D>()
const raycaster = new THREE.Raycaster()
const emit = defineEmits(["setActiveCountryCode"])
const hoveredCountries = shallowRef<THREE.Object3D[]>([])
let outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
)
composer.addPass(outlinePass)

function handleHover(event: MouseEvent) {
  hoveredCountries.value = []
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  )
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(scene, true)
  if (intersects.length === 0) return
  hoveredCountries.value.push(intersects[0].object)
  outlinePass.selectedObjects = hoveredCountries.value
}

function handleClick(event: MouseEvent) {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  )
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(scene, true)
  if (intersects.length === 0) return
  const clickedCountryCode = intersects[0].object.name as CountryCode
  emit("setActiveCountryCode", clickedCountryCode)
}

async function loadModel() {
  loader.load(
    "/world/earth.fbx",
    (object: THREE.Object3D) => {
      object.scale.set(0.05, 0.05, 0.05)
      scene.add(object)
      world.value = object
    },
    (event: ProgressEvent) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100)
        console.log(percentComplete + "% loaded")
      }
    },
    (error: unknown) => {
      console.error(error)
    }
  )
}

onMounted(() => {
  loadModel()
  renderer.domElement.addEventListener("click", handleClick)
  renderer.domElement.addEventListener("pointermove", handleHover)
})
</script>

<template></template>
