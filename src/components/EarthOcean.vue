<script setup lang="ts">
import * as THREE from "three"
import { onMounted, onUnmounted } from "vue"

const props = defineProps<{
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
}>()

const earthRadius = 4.97
const oceanGeometry = new THREE.SphereGeometry(earthRadius, 64, 64)

const oceanShader = {
  uniforms: {
    time: { value: 0 },
    uSurfaceColor: { value: new THREE.Color("#00a6fb") },
    uDepthColor: { value: new THREE.Color("#007ea7") },
    uColorOffset: { value: 0.08 },
    uColorMultiplier: { value: 5 },
    uFresnelScale: { value: 1.0 },
    uFresnelPower: { value: 1.5 }
  },
  vertexShader: `
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      float wave = sin(position.x * 2.0 + time) * 
                   cos(position.z * 2.0 + time) * 0.02;
      vec3 pos = position + normal * wave;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uSurfaceColor;
    uniform vec3 uDepthColor;
    uniform float uColorOffset;
    uniform float uColorMultiplier;
    uniform float uFresnelScale;
    uniform float uFresnelPower;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      float fresnel = uFresnelScale * pow(1.0 - max(0.0, dot(viewDirection, vNormal)), uFresnelPower);
      
      vec3 color = mix(uDepthColor, uSurfaceColor, fresnel * uColorMultiplier + uColorOffset);

      gl_FragColor = vec4(color, 1.0);
    }
  `
}

const oceanMaterial = new THREE.ShaderMaterial({
  uniforms: oceanShader.uniforms,
  vertexShader: oceanShader.vertexShader,
  fragmentShader: oceanShader.fragmentShader,
  side: THREE.FrontSide
})

const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial)
ocean.name = "Ocean"

let animationFrameId: number

function animate() {
  oceanMaterial.uniforms.time.value += 0.01
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  props.scene.add(ocean)
  animate()
})

onUnmounted(() => {
  props.scene.remove(ocean)
  cancelAnimationFrame(animationFrameId)
})
</script>

<template></template>
