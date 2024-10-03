<script setup lang="ts">
import { Icosahedron, OrbitControls, Stars, useFBX } from "@tresjs/cientos"
import { TresCanvas } from "@tresjs/core"
import * as THREE from "three"
import { onMounted, shallowRef } from "vue"

const raycaster = new THREE.Raycaster()
const world = shallowRef(new THREE.Object3D())
const camera = shallowRef(
  new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
)
let showWorld = true

async function loadModel() {
  await new Promise((res) => setTimeout(res, 1000))

  const loadedModel = await useFBX("/world/earth.fbx")
  world.value = loadedModel
}

function handleClick(event: MouseEvent) {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  )
  raycaster.setFromCamera(mouse, camera.value)
  const intersects = raycaster.intersectObjects(world.value.children)
  if (intersects.length === 0) return
  console.log(intersects[0].object.name)
}

onMounted(() => {
  loadModel()
})
</script>

<template>
  <TresCanvas clear-color="#181818" window-size>
    <TresPerspectiveCamera ref="camera" :position="[11, 11, 11]" />
    <OrbitControls :enablePan="false" />
    <Suspense>
      <primitive :visible="showWorld" @click="handleClick" :scale="0.05" :object="world" />
    </Suspense>
    <Stars :radius="100" :depth="50" :count="5000" :size="0.3" :size-attenuation="true" />
    <Icosahedron :args="[4.98, 5]" :position="[0, 0, 0]" />
    <TresDirectionalLight :intensity="2" :position="[3, 3, 3]" />
    <TresAmbientLight />
  </TresCanvas>
</template>
