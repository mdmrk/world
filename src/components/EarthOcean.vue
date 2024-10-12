<script setup lang="ts">
import * as THREE from "three"

const { scene } = defineProps<{
  scene: THREE.Scene
}>()

const ico = new THREE.IcosahedronGeometry(4.97, 5)

const simpleWaterShader = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color("#0096c7") },
    waveHeight: { value: 0.03 },
    waveFrequency: { value: 2.0 }
  },

  vertexShader: `
    uniform float time;
    uniform float waveHeight;
    uniform float waveFrequency;
    varying vec3 vPosition;

    void main() {
      vPosition = position;
      
      // Simple wave effect
      float wave = sin(position.x * waveFrequency + time) * 
                   cos(position.z * waveFrequency + time) * 
                   waveHeight;
      
      vec3 newPosition = position + normal * wave;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 color;
    varying vec3 vPosition;

    void main() {
      // Simple color gradient based on y-position
      float gradient = smoothstep(-5.0, 5.0, vPosition.y);
      vec3 finalColor = mix(color * 0.7, color, gradient);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

const waterMaterial = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.clone(simpleWaterShader.uniforms),
  vertexShader: simpleWaterShader.vertexShader,
  fragmentShader: simpleWaterShader.fragmentShader
})

const ocean = new THREE.Mesh(ico, waterMaterial)
ocean.name = "Ocean"
ocean.position.set(0, 0, 0)
scene.add(ocean)

// Animation loop to update time uniform
function animate() {
  requestAnimationFrame(animate)
  waterMaterial.uniforms.time.value += 0.01
}
animate()
</script>

<template></template>
