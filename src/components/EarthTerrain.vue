<script lang="ts" setup>
import * as THREE from "three"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { onMounted, ref } from "vue"

const props = defineProps<{
  scene: THREE.Scene
}>()
const loader = new FBXLoader()
const camera = ref<THREE.Camera>()
const world = ref<THREE.Object3D>()
const raycaster = new THREE.Raycaster()
const emit = defineEmits(["setActiveCountryCode"])

function handleClick(event: MouseEvent) {
  if (!camera.value || !world.value) return

  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  )
  raycaster.setFromCamera(mouse, camera.value)
  const intersects = raycaster.intersectObjects(world.value.children)
  if (intersects.length === 0) return
  const clickedCountryCode = intersects[0].object.name as CountryCode
  emit("setActiveCountryCode", clickedCountryCode)
}

async function loadModel() {
  loader.load(
    "/world/earth.fbx",
    (object) => {
      object.scale.set(0.05, 0.05, 0.05)
      props.scene.add(object)
      world.value = object
    },
    (xhr) => {
      console.log(Math.round((xhr.loaded / xhr.total) * 100) + "% loaded")
    },
    (error) => {
      console.error(error)
    }
  )
}

onMounted(() => {
  loadModel()
})
</script>
