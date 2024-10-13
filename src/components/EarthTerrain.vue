<script lang="ts" setup>
import { initialCameraLookAt, initialCameraPosition } from "@/consts"
import type { CountryCode } from "@/types"
import type CameraControls from "camera-controls"
import * as THREE from "three"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { onMounted, onUnmounted, shallowRef } from "vue"

const props = defineProps<{
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  cameraControls: CameraControls | undefined
}>()
const emit = defineEmits<{
  (e: "setActiveCountryCode", countryCode: CountryCode | undefined): void
}>()
const loader = new FBXLoader()
const world = shallowRef<THREE.Object3D>()
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const countryMaterials = new Map<CountryCode, THREE.Material>()
const colors = ["#bc6c25", "#588157", "#a3b18a", "#a68a64"].map((color) => new THREE.Color(color))

let startInteraction = {
  x: 0,
  y: 0
}

function createCountryMaterial(countryCode: CountryCode) {
  const color = colors[Math.floor(Math.random() * colors.length)]
  const material = new THREE.MeshPhongMaterial({
    color: color,
    shininess: 0
  })
  countryMaterials.set(countryCode, material)
  return material
}

function zoomToCountry(country: THREE.Mesh): Promise<void[]> {
  if (!country || !props.cameraControls) return Promise.resolve([])

  const promises: Promise<void>[] = []
  const aabb = new THREE.Box3().setFromObject(country)
  const center = new THREE.Vector3()
  aabb.getCenter(center)

  const padding = 0.2
  aabb.min.subScalar(padding)
  aabb.max.addScalar(padding)

  const directionToCountry = center.clone().normalize()
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    directionToCountry
  )

  const obb = new THREE.Box3()
  const corners = [
    new THREE.Vector3(aabb.min.x, aabb.min.y, aabb.min.z),
    new THREE.Vector3(aabb.min.x, aabb.min.y, aabb.max.z),
    new THREE.Vector3(aabb.min.x, aabb.max.y, aabb.min.z),
    new THREE.Vector3(aabb.min.x, aabb.max.y, aabb.max.z),
    new THREE.Vector3(aabb.max.x, aabb.min.y, aabb.min.z),
    new THREE.Vector3(aabb.max.x, aabb.min.y, aabb.max.z),
    new THREE.Vector3(aabb.max.x, aabb.max.y, aabb.min.z),
    new THREE.Vector3(aabb.max.x, aabb.max.y, aabb.max.z)
  ]

  corners.forEach((corner) => {
    corner.applyQuaternion(quaternion)
    obb.expandByPoint(corner)
  })

  const size = new THREE.Vector3()
  obb.getSize(size)

  promises.push(props.cameraControls.moveTo(center.x, center.y, center.z, true))

  if (props.cameraControls.camera instanceof THREE.PerspectiveCamera) {
    const fov = props.cameraControls.camera.fov * (Math.PI / 180)
    const aspectRatio = props.cameraControls.camera.aspect
    const distance = Math.max(size.x / aspectRatio, size.y) / (2 * Math.tan(fov / 2))
    promises.push(props.cameraControls.dollyTo(distance, true))
  }

  promises.push(props.cameraControls.setFocalOffset(0, 0, 0, true))
  const spherical = new THREE.Spherical().setFromVector3(directionToCountry)
  promises.push(props.cameraControls.rotateTo(spherical.theta, spherical.phi, true))

  return Promise.all(promises)
}

function resetZoom() {
  if (!props.cameraControls) {
    return
  }
  props.cameraControls.setLookAt(
    initialCameraPosition.x,
    initialCameraPosition.y,
    initialCameraPosition.z,
    initialCameraLookAt.x,
    initialCameraLookAt.y,
    initialCameraLookAt.z,
    true
  )
  props.cameraControls.dollyTo(initialCameraPosition.length(), true)
}

function animate() {
  props.renderer.render(props.scene, props.camera)
  requestAnimationFrame(animate)
}

async function loadModel() {
  loader.load(
    "/world/earth.fbx",
    (object: THREE.Object3D) => {
      object.scale.set(0.05, 0.05, 0.05)
      object.position.set(0, 0, 0)

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const countryCode = child.name as CountryCode
          child.material = createCountryMaterial(countryCode)
        }
      })

      props.scene.add(object)
      world.value = object
    },
    (event: ProgressEvent) => {},
    (error: unknown) => {
      console.error("Error loading model:", error)
    }
  )
}

function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  props.scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  props.scene.add(directionalLight)
}

function onWindowResize() {
  const width = window.innerWidth
  const height = window.innerHeight
  if (props.camera instanceof THREE.PerspectiveCamera) {
    props.camera.aspect = width / height
    props.camera.updateProjectionMatrix()
  }
  props.renderer.setSize(width, height)
}

function registerFirstClick(event: MouseEvent) {
  startInteraction.x = event.pageX
  startInteraction.y = event.pageY
}

function isTouchEvent(event: Event): event is TouchEvent {
  return "touches" in event
}

function handleInteractionStart(event: MouseEvent | TouchEvent) {
  const point = isTouchEvent(event) ? event.touches[0] : event
  startInteraction.x = point.pageX
  startInteraction.y = point.pageY
}

function handleInteractionEnd(event: MouseEvent | TouchEvent) {
  const point = isTouchEvent(event) ? event.touches[0] : event
  if (!isClickAndNotDrag(point.pageX, point.pageY)) {
    return
  }

  mouse.x = (point.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(point.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mouse, props.camera)

  if (world.value) {
    const intersects = raycaster.intersectObjects(world.value.children)

    if (intersects.length > 0 && intersects[0].object instanceof THREE.Mesh) {
      const countryCode = intersects[0].object.name as CountryCode
      if (["Ocean", "AQ"].indexOf(countryCode) === -1) {
        emit("setActiveCountryCode", countryCode)
        zoomToCountry(intersects[0].object)
      } else {
        emit("setActiveCountryCode", undefined)
        resetZoom()
      }
    } else {
      emit("setActiveCountryCode", undefined)
      resetZoom()
    }
  }
}

function isClickAndNotDrag(x: number, y: number): boolean {
  const delta = 6
  const diffX = Math.abs(x - startInteraction.x)
  const diffY = Math.abs(y - startInteraction.y)
  return diffX < delta && diffY < delta
}

onMounted(() => {
  setupLighting()
  loadModel()
  const canvas = props.renderer.domElement
  canvas.addEventListener("mousedown", handleInteractionStart)
  canvas.addEventListener("mouseup", handleInteractionEnd)
  canvas.addEventListener("touchstart", handleInteractionStart)
  canvas.addEventListener("touchend", handleInteractionEnd)
  window.addEventListener("resize", onWindowResize)
  animate()
})

onUnmounted(() => {
  const canvas = props.renderer.domElement
  canvas.removeEventListener("mousedown", handleInteractionStart)
  canvas.removeEventListener("mouseup", handleInteractionEnd)
  canvas.removeEventListener("touchstart", handleInteractionStart)
  canvas.removeEventListener("touchend", handleInteractionEnd)
  window.removeEventListener("resize", onWindowResize)
})
</script>

<template></template>
