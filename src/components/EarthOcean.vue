<script setup lang="ts">
import * as THREE from "three"

const { scene } = defineProps<{
  scene: THREE.Scene
}>()
const ico = new THREE.IcosahedronGeometry(4.97, 5)
const toonWaterShader = {
  uniforms: {
    surfaceNoise: { value: null },
    distortNoise: { value: null },
    beerFactor: { value: 0.8 },
    foamDistance: { value: 0.01 },
    foamMaxDistance: { value: 0.4 },
    foamMinDistance: { value: 0.04 },
    foamColor: { value: new THREE.Color(1, 1, 1) },
    surfaceNoiseTiling: { value: new THREE.Vector2(8.0, 4.0) },
    surfaceNoiseScroll: { value: new THREE.Vector3(0.03, 0.03, 0.0) },
    surfaceNoiseCutoff: { value: 0.777 },
    surfaceDistortionAmount: { value: 0.27 },
    depthGradientShallow: { value: new THREE.Color(0.325, 0.807, 0.971) },
    depthGradientDeep: { value: new THREE.Color(0.086, 0.407, 1) },
    depthMaxDistance: { value: 1.0 },
    depthFactor: { value: 1.0 },
    time: { value: 0 },
    radius: { value: 1.0 }
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D surfaceNoise;
    uniform sampler2D distortNoise;
    uniform float beerFactor;
    uniform float foamDistance;
    uniform float foamMaxDistance;
    uniform float foamMinDistance;
    uniform vec3 foamColor;
    uniform vec2 surfaceNoiseTiling;
    uniform vec3 surfaceNoiseScroll;
    uniform float surfaceNoiseCutoff;
    uniform float surfaceDistortionAmount;
    uniform vec3 depthGradientShallow;
    uniform vec3 depthGradientDeep;
    uniform float depthMaxDistance;
    uniform float depthFactor;
    uniform float time;
    uniform float radius;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    const float PI = 3.14159265359;
    const float SMOOTHSTEP_AA = 0.01;

    vec4 alphaBlend(vec4 top, vec4 bottom) {
      vec3 color = (top.rgb * top.a) + (bottom.rgb * (1.0 - top.a));
      float alpha = top.a + bottom.a * (1.0 - top.a);
      return vec4(color, alpha);
    }

    void main() {
      // Convert position to spherical coordinates
      float latitude = asin(vPosition.y / radius);
      float longitude = atan(vPosition.z, vPosition.x);

      // Normalize to [0, 1] range
      vec2 sphereUv = vec2(
        (longitude + PI) / (2.0 * PI),
        (latitude + PI / 2.0) / PI
      );

      // Calculate depth
      float depth = (length(vPosition) - radius) / (2.0 * radius);
      depth = 1.0 - exp(-depth * beerFactor);

      float normalDot = clamp(dot(vNormal, vec3(0, 1, 0)), 0.0, 1.0);
      float foamDistance = mix(foamMaxDistance, foamMinDistance, normalDot);

      float foamDepth = clamp(depth / foamDistance, 0.0, 1.0);
      float surfaceNoiseCutoff = foamDepth * surfaceNoiseCutoff;

      vec2 distortUV = sphereUv;
      vec4 distortNoiseSample = texture2D(distortNoise, distortUV);
      vec2 distortAmount = (distortNoiseSample.xy * 2.0 - 1.0) * surfaceDistortionAmount;

      vec2 noiseUV = sphereUv * surfaceNoiseTiling;
      vec2 noise_uv = vec2(
        (noiseUV.x + time * surfaceNoiseScroll.x) + distortAmount.x,
        (noiseUV.y + time * surfaceNoiseScroll.y + distortAmount.y)
      );
      float surfaceNoiseSample = texture2D(surfaceNoise, noise_uv).r;
      float surfaceNoiseAmount = smoothstep(surfaceNoiseCutoff - SMOOTHSTEP_AA, surfaceNoiseCutoff + SMOOTHSTEP_AA, surfaceNoiseSample);

      // Fade out effect near poles
      float poleFade = smoothstep(0.7, 1.0, abs(vPosition.y / radius));
      surfaceNoiseAmount *= 1.0 - poleFade;

      float waterDepth = clamp(depth / depthMaxDistance, 0.0, 1.0) * depthFactor;
      vec3 waterColor = mix(depthGradientShallow, depthGradientDeep, waterDepth);

      vec4 surfaceNoiseColor = vec4(foamColor, surfaceNoiseAmount);
      vec4 color = alphaBlend(surfaceNoiseColor, vec4(waterColor, 1.0));

      gl_FragColor = color;
    }
  `
}
const textureLoader = new THREE.TextureLoader()
const surfaceNoise = textureLoader.load("/world/PerlinNoise.png")
const distortNoise = textureLoader.load("/world/WaterDistortion.png")
const waterMaterial = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.clone(toonWaterShader.uniforms),
  vertexShader: toonWaterShader.vertexShader,
  fragmentShader: toonWaterShader.fragmentShader,
  transparent: true
})
waterMaterial.uniforms.surfaceNoise.value = surfaceNoise
waterMaterial.uniforms.distortNoise.value = distortNoise
const ocean = new THREE.Mesh(ico, waterMaterial)
ocean.name = "Ocean"
ocean.position.set(0, 0, 0)
scene.add(ocean)
</script>

<template></template>
