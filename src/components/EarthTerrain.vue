<script lang="ts" setup>
import type { CountryCode } from "@/types"
import * as THREE from "three"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { onMounted, onUnmounted, shallowRef } from "vue"

const props = defineProps<{
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  composer: EffectComposer
}>()

const emit = defineEmits<{
  (e: "setActiveCountryCode", countryCode: CountryCode | undefined): void
}>()

const loader = new FBXLoader()
const world = shallowRef<THREE.Object3D>()
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const hoveredCountry = shallowRef<THREE.Mesh | null>(null)

// Create render targets
let idRenderTarget: THREE.WebGLRenderTarget
let depthRenderTarget: THREE.WebGLRenderTarget

// Map to store country codes and their corresponding color values
const countryColorMap = new Map<string, THREE.Color>()

const outlineShader = {
  uniforms: {
    tDiffuse: { value: null },
    idTexture: { value: null },
    depthTexture: { value: null },
    hoveredCountryColor: { value: new THREE.Color(0, 0, 0) },
    outlineColor: { value: new THREE.Color(0x00ff00) },
    outlineWidth: { value: 2.0 },
    resolution: { value: new THREE.Vector2() }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D idTexture;
    uniform sampler2D depthTexture;
    uniform vec3 hoveredCountryColor;
    uniform vec3 outlineColor;
    uniform float outlineWidth;
    uniform vec2 resolution;
    varying vec2 vUv;

    void main() {
      vec4 originalColor = texture2D(tDiffuse, vUv);
      vec3 id = texture2D(idTexture, vUv).rgb;
      float depth = texture2D(depthTexture, vUv).r;
      
      float outline = 0.0;
      float pixelWidth = outlineWidth / resolution.x;
      float pixelHeight = outlineWidth / resolution.y;
      
      if (distance(id, hoveredCountryColor) < 0.01) {
        for(float x = -1.0; x <= 1.0; x++) {
          for(float y = -1.0; y <= 1.0; y++) {
            if(x == 0.0 && y == 0.0) continue;
            
            vec2 sampleUV = vUv + vec2(x * pixelWidth, y * pixelHeight);
            vec3 neighborId = texture2D(idTexture, sampleUV).rgb;
            float neighborDepth = texture2D(depthTexture, sampleUV).r;
            
            if (distance(neighborId, hoveredCountryColor) >= 0.01 || neighborDepth < depth) {
              outline = 1.0;
              break;
            }
          }
          if(outline > 0.0) break;
        }
      }
      
      if(outline > 0.0) {
        gl_FragColor = vec4(outlineColor, 1.0);
      } else {
        gl_FragColor = originalColor;
      }
    }
  `
}

function initRenderTargets() {
  const renderTargetParams = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType
  }

  idRenderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    renderTargetParams
  )

  depthRenderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    renderTargetParams
  )

  const outlinePass = new ShaderPass({
    uniforms: outlineShader.uniforms,
    vertexShader: outlineShader.vertexShader,
    fragmentShader: outlineShader.fragmentShader
  })
  outlinePass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight)
  props.composer.addPass(outlinePass)
}

function updateHoveredCountry(newHoveredCountry: THREE.Mesh | null) {
  hoveredCountry.value = newHoveredCountry

  const outlinePass = props.composer.passes[props.composer.passes.length - 1] as ShaderPass
  if (newHoveredCountry) {
    const countryCode = newHoveredCountry.name as CountryCode
    const color = countryColorMap.get(countryCode)
    if (color) {
      outlinePass.uniforms.hoveredCountryColor.value.copy(color)
    }
  } else {
    outlinePass.uniforms.hoveredCountryColor.value.set(0, 0, 0)
  }
}

function handleHover(event: MouseEvent) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, props.camera)

  if (world.value) {
    const intersects = raycaster.intersectObjects(world.value.children, true)

    let newHoveredCountry: THREE.Mesh | null = null
    if (intersects.length > 0 && intersects[0].object instanceof THREE.Mesh) {
      newHoveredCountry = intersects[0].object
    }

    if (newHoveredCountry !== hoveredCountry.value) {
      updateHoveredCountry(newHoveredCountry)
    }
  }
}

function handleClick(event: MouseEvent) {
  if (hoveredCountry.value) {
    const countryCode = hoveredCountry.value.name as CountryCode
    emit("setActiveCountryCode", countryCode)
  } else {
    emit("setActiveCountryCode", undefined)
  }
}

function createIdMaterial(countryCode: string) {
  const color = countryColorMap.get(countryCode)
  if (!color) {
    console.error(`No color found for country code: ${countryCode}`)
    return new THREE.MeshBasicMaterial({ color: 0x000000 })
  }

  return new THREE.MeshBasicMaterial({ color: color })
}

function animate() {
  // Render IDs
  const currentMaterials = new Map<THREE.Object3D, THREE.Material>()
  if (world.value) {
    world.value.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        currentMaterials.set(child, child.material)
        child.material = createIdMaterial(child.name)
      }
    })
  }

  props.renderer.setRenderTarget(idRenderTarget)
  props.renderer.render(props.scene, props.camera)

  // Render depths
  props.renderer.setRenderTarget(depthRenderTarget)
  props.renderer.render(props.scene, props.camera)

  // Restore materials
  currentMaterials.forEach((material, object) => {
    if (object instanceof THREE.Mesh) {
      object.material = material
    }
  })

  props.renderer.setRenderTarget(null)

  // Update shader uniforms
  const outlinePass = props.composer.passes[props.composer.passes.length - 1] as ShaderPass
  outlinePass.uniforms.idTexture.value = idRenderTarget.texture
  outlinePass.uniforms.depthTexture.value = depthRenderTarget.texture

  // Render the final scene
  props.composer.render()

  requestAnimationFrame(animate)
}

async function loadModel() {
  loader.load(
    "/world/earth.fbx",
    (object: THREE.Object3D) => {
      object.scale.set(0.05, 0.05, 0.05)
      object.position.set(0, 0, 0)
      const material = new THREE.MeshPhongMaterial({
        color: 0x181818,
        shininess: 0
      })

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = material.clone()
          const countryCode = child.name as CountryCode
          if (!countryColorMap.has(countryCode)) {
            countryColorMap.set(
              countryCode,
              new THREE.Color(Math.random(), Math.random(), Math.random())
            )
          }
        }
      })

      props.scene.add(object)
      world.value = object
    },
    (event: ProgressEvent) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100)
        console.log(`${percentComplete}% loaded`)
      }
    },
    (error: unknown) => {
      console.error("Error loading model:", error)
    }
  )
}

onMounted(() => {
  loadModel()
  initRenderTargets()
  props.renderer.domElement.addEventListener("click", handleClick)
  window.addEventListener("pointermove", handleHover)
  animate()
})

onUnmounted(() => {
  props.renderer.domElement.removeEventListener("click", handleClick)
  window.removeEventListener("pointermove", handleHover)
})
</script>

<template>
  <!-- Renderer is handled externally -->
</template>
