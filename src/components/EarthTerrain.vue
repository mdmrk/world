<script lang="ts" setup>
import type { CountryCode } from "@/types"
import { isMobile } from "@/utils"
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
const hoveredCountry = shallowRef<THREE.Mesh | undefined>(undefined)
const countryMaterials = new Map<CountryCode, THREE.Material>()

let startClick = {
  x: 0,
  y: 0
}

const colors = [new THREE.Color(1, 0, 0), new THREE.Color(0, 1, 0), new THREE.Color(0, 0, 1)]

function createCountryMaterial(countryCode: CountryCode) {
  const color = colors[Math.floor(Math.random() * colors.length)]
  const material = new THREE.MeshPhongMaterial({
    color: color,
    shininess: 30
  })
  countryMaterials.set(countryCode, material)
  return material
}

function handleHover(event: MouseEvent) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, props.camera)

  if (world.value) {
    const intersects = raycaster.intersectObjects(world.value.children, true)

    let newHoveredCountry: THREE.Mesh | undefined = undefined
    if (intersects.length > 0 && intersects[0].object instanceof THREE.Mesh) {
      newHoveredCountry = intersects[0].object
    }

    if (newHoveredCountry !== hoveredCountry.value) {
      hoveredCountry.value = newHoveredCountry
    }
  }
}

function handleClick(event: MouseEvent) {
  if (!isClickAndNotDrag(event.pageX, event.pageY)) {
    return
  }
  if (hoveredCountry.value) {
    const countryCode = hoveredCountry.value.name as CountryCode
    emit("setActiveCountryCode", countryCode)
    zoomToCountry(hoveredCountry.value)
  } else {
    emit("setActiveCountryCode", undefined)
    resetZoom()
  }
}

function zoomToCountry(country: THREE.Mesh): Promise<void[]> {
  if (!country || !props.cameraControls) return Promise.resolve([])

  const promises: Promise<void>[] = []
  const aabb = new THREE.Box3().setFromObject(country)
  const center = new THREE.Vector3()
  aabb.getCenter(center)

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
    const distance = Math.max(size.x, size.y) / (2 * Math.tan(fov / 2))
    promises.push(props.cameraControls.dollyTo(distance, true))
  } else if (props.cameraControls.camera instanceof THREE.OrthographicCamera) {
    const aspect = props.cameraControls.camera.right / props.cameraControls.camera.top
    const zoom = Math.min(1 / size.x, 1 / (size.y * aspect))
    promises.push(props.cameraControls.zoomTo(zoom, true))
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
  props.cameraControls.setLookAt(11, 21, 31, 0, 0, 0, true)
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
  startClick.x = event.pageX
  startClick.y = event.pageY
}

function isClickAndNotDrag(x: number, y: number): boolean {
  const delta = 6
  const diffX = Math.abs(x - startClick.x)
  const diffY = Math.abs(y - startClick.y)
  return diffX < delta && diffY < delta
}

onMounted(() => {
  setupLighting()
  loadModel()
  props.renderer.domElement.addEventListener("mouseup", handleClick)
  if (!isMobile()) {
    window.addEventListener("pointermove", handleHover)
  }
  window.addEventListener("mousedown", registerFirstClick)
  window.addEventListener("resize", onWindowResize)
  animate()
})

onUnmounted(() => {
  props.renderer.domElement.removeEventListener("mouseup", handleClick)
  window.removeEventListener("mousedown", registerFirstClick)
  if (!isMobile()) {
    window.removeEventListener("pointermove", handleHover)
  }
  window.removeEventListener("resize", onWindowResize)
})
</script>

<template></template>
