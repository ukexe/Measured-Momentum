"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

import {
  advanceKineticPhase,
  clampKineticFrameDelta,
  createKineticRibbonBuffers,
  createKineticRibbonScratch,
  createKineticSpanPositions,
  writeKineticRibbonFrame,
  writeKineticSpanFrame,
} from "@/components/three/kinetic-duet-geometry";
import type { StageInput, StageVariant } from "@/components/three/stage-types";

type StageSceneProps = {
  readonly active: boolean;
  readonly input: MutableRefObject<StageInput>;
  readonly lowQuality: boolean;
  readonly onFailure: () => void;
  readonly onReady: () => void;
  readonly requestRenderRef: MutableRefObject<(() => void) | null>;
  readonly variant: StageVariant;
};

type Vec3 = readonly [number, number, number];

const FLOOR_Y = -1.6;
const ORB_COUNT = 8;
const ORB_RADIUS = 4.4;
const LOW_QUALITY_PARTICLE_COUNT = 2_200;
const HIGH_QUALITY_PARTICLE_COUNT = 6_000;
const LOW_QUALITY_REGISTRATION_ROWS = 20;
const HIGH_QUALITY_REGISTRATION_ROWS = 56;
const LOW_QUALITY_FRAME_INTERVAL_MS = 50;
const HIGH_QUALITY_FRAME_INTERVAL_MS = 1000 / 30;
const TAU = Math.PI * 2;

const PALETTE = {
  void: "#06070c",
  lime: "#d9f257",
  coral: "#ff6b86",
  teal: "#45d6cc",
  step: "#9aaaff",
  brass: "#d9b878",
} as const;

const BEAMS = [
  {
    aim: [-0.8, 0, 0.4] as Vec3,
    colour: PALETTE.lime,
    intensity: 0.34,
    origin: [-6.2, 8.6, 2.2] as Vec3,
    phase: 0,
    speed: 0.23,
    sway: [1.6, 1.1] as const,
  },
  {
    aim: [0.9, 0, -0.2] as Vec3,
    colour: PALETTE.coral,
    intensity: 0.36,
    origin: [6.4, 8.8, 0.8] as Vec3,
    phase: 2.1,
    speed: 0.19,
    sway: [1.4, 1.3] as const,
  },
  {
    aim: [0, 0, -0.6] as Vec3,
    colour: PALETTE.teal,
    intensity: 0.3,
    origin: [0.4, 9.4, -6.5] as Vec3,
    phase: 4.2,
    speed: 0.15,
    sway: [2.1, 0.8] as const,
  },
] as const;

const HOME_WIDE_POSITIONS: readonly Vec3[] = [
  [-2.7, 0.5, 10.4],
  [0.4, 2.9, 9.6],
  [8.4, 1.7, 5.4],
  [1.2, 11.8, 3.4],
  [-8.6, 3.3, -4.6],
  [-2.6, 1.5, 14.8],
  [0, 7.2, 23.5],
];
const HOME_WIDE_TARGETS: readonly Vec3[] = [
  [-3, 0.05, 0],
  [0, -0.5, 0],
  [0.2, -0.3, 0],
  [0, -1.4, 0],
  [0, 0, 0],
  [0, 0.4, 0],
  [0, 0.5, 0],
];
const HOME_TALL_POSITIONS: readonly Vec3[] = [
  [0, 1.6, 15.5],
  [0.4, 4.2, 13.5],
  [10.5, 2.4, 7.5],
  [1, 15, 4],
  [-11, 4, -6],
  [-3, 2, 19],
  [0, 8, 28],
];
const HOME_TALL_TARGETS: readonly Vec3[] = [
  [0, 1.1, 0],
  [0, -0.2, 0],
  [0.2, -0.3, 0],
  [0, -1.4, 0],
  [0, 0, 0],
  [0, 0.4, 0],
  [0, 0.5, 0],
];

const COLOURSPACE_CHUNK = "#include <colorspace_fragment>";

const FLOOR_VERTEX = /* glsl */ `
varying vec3 vWorld;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const FLOOR_FRAGMENT = /* glsl */ `
uniform float uBeat;
uniform float uDim;
uniform float uTime;
uniform vec3 uBase;
uniform vec3 uCoral;
uniform vec3 uLime;
uniform vec3 uTeal;
uniform vec3 uPoolA;
uniform vec3 uPoolB;
uniform vec3 uPoolC;
uniform vec3 uPoolColourA;
uniform vec3 uPoolColourB;
uniform vec3 uPoolColourC;
varying vec3 vWorld;

float gridLine(float value, float width) {
  float distanceToLine = abs(fract(value + 0.5) - 0.5);
  float filterWidth = max(fwidth(value), 0.0001) * width;
  return 1.0 - smoothstep(0.0, filterWidth, distanceToLine);
}

float pool(vec2 point, vec3 spot) {
  vec2 offset = point - spot.xy;
  return exp(-dot(offset, offset) * 0.42) * spot.z;
}

void main() {
  vec2 point = vWorld.xz;
  float radius = length(point);
  float angle = atan(point.y, point.x);
  float sectorWidth = 6.28318530718 / 8.0;
  float count = floor(mod(uBeat, 8.0));
  float beatPhase = fract(uBeat);
  float sector = floor((angle + 3.14159265359) / sectorWidth);

  float rings = gridLine(radius / 0.9, 1.3) * (1.0 - smoothstep(1.6, 13.0, radius));
  float spokes = gridLine(angle / sectorWidth, 1.1)
    * (1.0 - smoothstep(1.4, 9.5, radius))
    * smoothstep(0.7, 2.4, radius);
  float activeSector = 1.0 - step(0.5, abs(sector - count));
  float wash = activeSector * (1.0 - beatPhase) * (1.0 - smoothstep(1.8, 6.5, radius)) * smoothstep(1.2, 2.2, radius);
  float wave = beatPhase * 7.5;
  float pulse = exp(-abs(radius - wave) * 4.0) * (1.0 - beatPhase);
  float glow = exp(-radius * radius * 0.1);
  float shimmer = 0.5 + 0.5 * sin(uTime * 0.6 + radius * 1.7);

  vec3 colour = uBase;
  colour += uTeal * glow * 0.16;
  colour += mix(uTeal, uLime, shimmer) * rings * 0.14;
  colour += uLime * spokes * 0.07;
  colour += uCoral * wash * 0.22;
  colour += uLime * pulse * 0.42;
  colour += uPoolColourA * pool(point, uPoolA) * 0.5;
  colour += uPoolColourB * pool(point, uPoolB) * 0.5;
  colour += uPoolColourC * pool(point, uPoolC) * 0.5;
  colour = mix(colour, uBase, uDim * 0.5);

  float alpha = 1.0 - smoothstep(5.0, 17.0, radius);
  gl_FragColor = vec4(colour, alpha);
  ${COLOURSPACE_CHUNK}
}
`;

const BEAM_VERTEX = /* glsl */ `
varying float vHeight;
varying vec3 vNormalView;
varying vec3 vViewDirection;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vNormalView = normalize(normalMatrix * normal);
  vViewDirection = normalize(-viewPosition.xyz);
  vHeight = uv.y;
  gl_Position = projectionMatrix * viewPosition;
}
`;

const BEAM_FRAGMENT = /* glsl */ `
uniform vec3 uColour;
uniform float uIntensity;
uniform float uTime;
varying float vHeight;
varying vec3 vNormalView;
varying vec3 vViewDirection;

void main() {
  float facing = abs(dot(normalize(vNormalView), normalize(vViewDirection)));
  float core = pow(facing, 2.4);
  float fade = smoothstep(0.0, 0.9, vHeight) * (0.3 + 0.7 * vHeight);
  float dust = 0.86 + 0.14 * sin(uTime * 2.1 + vHeight * 23.0);
  float alpha = core * fade * dust * uIntensity;
  gl_FragColor = vec4(uColour, alpha);
  ${COLOURSPACE_CHUNK}
}
`;

const PARTICLE_VERTEX = /* glsl */ `
uniform float uPixelRatio;
uniform float uPointerStrength;
uniform float uBeat;
uniform float uDim;
uniform float uScroll;
uniform float uTime;
uniform vec3 uColourA;
uniform vec3 uColourB;
uniform vec3 uColourC;
uniform vec3 uPointer;
uniform vec3 uRegistrationColour;
attribute vec4 aSeed;
varying float vAlpha;
varying float vCadence;
varying vec3 vColour;

void main() {
  vec3 point = position;
  float cadence = 1.0 - step(0.0, aSeed.w);
  float cadenceEnergy = 0.0;
  float countAccent = 0.0;
  float radius = length(point.xz);

  if (cadence > 0.5) {
    float cadenceSlot = floor(abs(aSeed.w) * 8.0);
    float activeSlot = mod(floor(uBeat), 8.0);
    float slotDistance = abs(cadenceSlot - activeSlot);
    slotDistance = min(slotDistance, 8.0 - slotDistance);
    countAccent = 1.0 - smoothstep(0.0, 0.75, slotDistance);

    float beatPhase = fract(uBeat);
    float countPulse = pow(0.5 + 0.5 * cos(beatPhase * 6.28318530718), 3.0);
    float depthPhase = fract(aSeed.z + uBeat * 0.08);
    float depthAccent = 1.0 - smoothstep(0.0, 0.12, abs(depthPhase - 0.5));
    cadenceEnergy = max(
      countAccent * (0.45 + countPulse * 0.55),
      depthAccent * 0.38
    );

    float registrationEnvelope = sin(clamp(uScroll, 0.0, 1.0) * 3.14159265359);
    float side = step(3.5, cadenceSlot) * 2.0 - 1.0;
    point.x += side * registrationEnvelope * (0.08 + aSeed.z * 0.14);
    point.z += sin(uScroll * 6.28318530718 + aSeed.z * 3.14159265359) * 0.08;
  } else {
    float swirl = uTime * (0.012 + 0.1 / (1.0 + radius * 0.3));
    float cosine = cos(swirl);
    float sine = sin(swirl);
    point.xz = mat2(cosine, -sine, sine, cosine) * point.xz;
    point.y += sin(uTime * (0.2 + aSeed.x * 0.3) + aSeed.y * 6.2831 + radius * 0.3) * (0.16 + aSeed.z * 0.3);

    vec3 away = point - uPointer;
    float pointerDistance = length(away);
    point += (away / max(pointerDistance, 0.0001)) * (1.0 - smoothstep(0.0, 2.8, pointerDistance)) * uPointerStrength;
  }

  vec4 viewPosition = modelViewMatrix * vec4(point, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  float depth = -viewPosition.z;

  if (cadence > 0.5) {
    gl_PointSize = clamp(
      (3.4 + cadenceEnergy * 2.8) * uPixelRatio * (9.0 / max(depth, 1.0)),
      1.5,
      7.5
    );
    float depthVisibility =
      (1.0 - smoothstep(24.0, 58.0, depth)) *
      smoothstep(0.4, 2.2, depth);
    vAlpha =
      (0.16 + cadenceEnergy * 0.68) *
      depthVisibility *
      (1.0 - uDim * 0.52);
    vCadence = 0.35 + cadenceEnergy * 0.65;
    vColour = mix(
      uRegistrationColour,
      uColourB,
      0.18 + countAccent * 0.42
    );
  } else {
    float size = mix(1.3, 4.4, aSeed.x * aSeed.x * aSeed.x);
    gl_PointSize = size * uPixelRatio * (14.0 / max(depth, 0.5));
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.7 + aSeed.z * 2.2) + aSeed.y * 31.0);
    vAlpha = twinkle * (1.0 - smoothstep(9.0, 52.0, depth)) * smoothstep(0.4, 2.2, depth);
    vCadence = 0.0;
    vColour = aSeed.w < 0.5
      ? mix(uColourA, uColourB, aSeed.w * 2.0)
      : mix(uColourB, uColourC, aSeed.w * 2.0 - 1.0);
  }
}
`;

const SPARK_VERTEX = /* glsl */ `
uniform float uPixelRatio;
uniform float uTime;
attribute float aSeed;
varying float vAlpha;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  float flicker = 0.5 + 0.5 * sin(uTime * 3.2 + aSeed * 57.0);
  gl_PointSize = (1.6 + flicker * 3.2) * uPixelRatio * (10.0 / max(-viewPosition.z, 0.5));
  vAlpha = 0.35 + flicker * 0.65;
}
`;

const POINT_FRAGMENT = /* glsl */ `
uniform vec3 uTint;
varying float vAlpha;
#ifdef USE_VERTEX_COLOUR
varying float vCadence;
varying vec3 vColour;
#endif

void main() {
  float distanceToCentre = length(gl_PointCoord - 0.5);
  float core = 1.0 - smoothstep(0.0, 0.5, distanceToCentre);
  float shape = core * core;
  #ifdef USE_VERTEX_COLOUR
  if (vCadence > 0.01) {
    float horizontal =
      (1.0 - smoothstep(0.38, 0.49, abs(gl_PointCoord.x - 0.5))) *
      (1.0 - smoothstep(0.06, 0.14, abs(gl_PointCoord.y - 0.5)));
    float vertical =
      (1.0 - smoothstep(0.06, 0.14, abs(gl_PointCoord.x - 0.5))) *
      (1.0 - smoothstep(0.38, 0.49, abs(gl_PointCoord.y - 0.5)));
    shape = mix(
      horizontal,
      max(horizontal, vertical),
      smoothstep(0.72, 0.94, vCadence)
    );
  }
  #endif
  float alpha = shape * vAlpha;
  if (alpha < 0.004) discard;
  #ifdef USE_VERTEX_COLOUR
  vec3 colour = vColour;
  #else
  vec3 colour = uTint;
  #endif
  gl_FragColor = vec4(colour * (0.65 + shape), alpha);
  ${COLOURSPACE_CHUNK}
}
`;

function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createCurve(points: readonly Vec3[]) {
  return new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "centripetal",
  );
}

function createParticleGeometry(count: number, registrationRows: number) {
  const random = createRandom(0x5a7f13);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  const registrationCount = registrationRows * ORB_COUNT;

  for (let index = 0; index < count; index += 1) {
    if (index < registrationCount) {
      const row = Math.floor(index / ORB_COUNT);
      const slot = index % ORB_COUNT;
      const rowProgress =
        registrationRows > 1 ? row / (registrationRows - 1) : 0;
      const x = (slot - (ORB_COUNT - 1) / 2) * 1.82;
      const z = THREE.MathUtils.lerp(8.5, -20, rowProgress);

      positions.set([x, FLOOR_Y + 0.055, z], index * 3);
      seeds.set(
        [0.5, slot / (ORB_COUNT - 1), rowProgress, -(slot + 0.5) / ORB_COUNT],
        index * 4,
      );
      continue;
    }

    let x: number;
    let y: number;
    let z: number;

    if (index % 10 < 7) {
      const arm = index % 3;
      const radius = 3.4 + Math.pow(random(), 0.7) * 16;
      const angle =
        (arm / 3) * Math.PI * 2 + radius * 0.42 + (random() - 0.5) * 0.9;
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      y = -1.25 + (random() - 0.3) * (0.5 + radius * 0.13);
    } else {
      const radius = 2 + random() * 22;
      const angle = random() * Math.PI * 2;
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      y = -1.4 + random() * 12;
    }

    positions.set([x, y, z], index * 3);
    seeds.set([random(), random(), random(), random()], index * 4);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 2, 0), 34);

  return geometry;
}

function createRibbon(segments: number, colour: string) {
  const buffers = createKineticRibbonBuffers(segments);
  const geometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.BufferAttribute(buffers.positions, 3);
  const normalAttribute = new THREE.BufferAttribute(buffers.normals, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  normalAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("normal", normalAttribute);
  geometry.setIndex(new THREE.BufferAttribute(buffers.indices, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4.5);

  const sparkSeeds = new Float32Array(buffers.positions.length / 3);
  const random = createRandom(segments * 31 + colour.length);
  for (let index = 0; index < sparkSeeds.length; index += 1) {
    sparkSeeds[index] = random();
  }
  const sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute("position", positionAttribute);
  sparkGeometry.setAttribute("aSeed", new THREE.BufferAttribute(sparkSeeds, 1));
  sparkGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4.5);

  const material = new THREE.MeshPhysicalMaterial({
    clearcoat: 0.6,
    clearcoatRoughness: 0.3,
    color: colour,
    emissive: colour,
    emissiveIntensity: 1,
    iridescence: 0.6,
    iridescenceIOR: 1.35,
    metalness: 0,
    roughness: 0.32,
    side: THREE.DoubleSide,
  });

  return {
    buffers,
    geometry,
    material,
    normalAttribute,
    positionAttribute,
    scratch: createKineticRibbonScratch(),
    sparkGeometry,
  };
}

function createPointMaterial(
  vertexShader: string,
  uniforms: Record<string, THREE.IUniform>,
  vertexColour: boolean,
) {
  return new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    defines: vertexColour ? { USE_VERTEX_COLOUR: "" } : {},
    depthWrite: false,
    fragmentShader: POINT_FRAGMENT,
    transparent: true,
    uniforms: { uTint: { value: new THREE.Color(PALETTE.lime) }, ...uniforms },
    vertexShader,
  });
}

function createStageResources(lowQuality: boolean) {
  const segments = lowQuality ? 72 : 144;
  const pixelRatio = Math.min(
    typeof window === "undefined" ? 1 : window.devicePixelRatio,
    lowQuality ? 1.25 : 1.75,
  );
  const ribbonA = createRibbon(segments, PALETTE.coral);
  const ribbonB = createRibbon(segments, PALETTE.teal);

  const spanPositions = createKineticSpanPositions();
  const spanAttribute = new THREE.BufferAttribute(spanPositions, 3);
  spanAttribute.setUsage(THREE.DynamicDrawUsage);
  const spanGeometry = new THREE.BufferGeometry();
  spanGeometry.setAttribute("position", spanAttribute);
  spanGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4.5);
  const spanMaterial = new THREE.LineBasicMaterial({
    color: PALETTE.brass,
    opacity: 0.55,
    transparent: true,
  });

  const floorGeometry = new THREE.PlaneGeometry(40, 40, 1, 1);
  floorGeometry.rotateX(-Math.PI / 2);
  const floorMaterial = new THREE.ShaderMaterial({
    depthWrite: true,
    fragmentShader: FLOOR_FRAGMENT,
    transparent: true,
    uniforms: {
      uBase: { value: new THREE.Color(PALETTE.void) },
      uBeat: { value: 0 },
      uCoral: { value: new THREE.Color(PALETTE.coral) },
      uDim: { value: 0 },
      uLime: { value: new THREE.Color(PALETTE.lime) },
      uPoolA: { value: new THREE.Vector3() },
      uPoolB: { value: new THREE.Vector3() },
      uPoolC: { value: new THREE.Vector3() },
      uPoolColourA: { value: new THREE.Color(BEAMS[0].colour) },
      uPoolColourB: { value: new THREE.Color(BEAMS[1].colour) },
      uPoolColourC: { value: new THREE.Color(BEAMS[2].colour) },
      uTeal: { value: new THREE.Color(PALETTE.teal) },
      uTime: { value: 0 },
    },
    vertexShader: FLOOR_VERTEX,
  });

  const beamGeometry = new THREE.ConeGeometry(
    1.7,
    13,
    lowQuality ? 24 : 48,
    1,
    true,
  );
  beamGeometry.rotateX(-Math.PI / 2);
  beamGeometry.translate(0, 0, 6.5);
  const beamMaterials = BEAMS.map(
    (beam) =>
      new THREE.ShaderMaterial({
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fragmentShader: BEAM_FRAGMENT,
        side: THREE.DoubleSide,
        transparent: true,
        uniforms: {
          uColour: { value: new THREE.Color(beam.colour) },
          uIntensity: { value: beam.intensity },
          uTime: { value: 0 },
        },
        vertexShader: BEAM_VERTEX,
      }),
  );

  const particleGeometry = createParticleGeometry(
    lowQuality ? LOW_QUALITY_PARTICLE_COUNT : HIGH_QUALITY_PARTICLE_COUNT,
    lowQuality ? LOW_QUALITY_REGISTRATION_ROWS : HIGH_QUALITY_REGISTRATION_ROWS,
  );
  const particleMaterial = createPointMaterial(
    PARTICLE_VERTEX,
    {
      uBeat: { value: 0 },
      uColourA: { value: new THREE.Color(PALETTE.lime) },
      uColourB: { value: new THREE.Color(PALETTE.step) },
      uColourC: { value: new THREE.Color(PALETTE.coral) },
      uDim: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uPointer: { value: new THREE.Vector3(0, 100, 0) },
      uPointerStrength: { value: lowQuality ? 0 : 1.1 },
      uRegistrationColour: { value: new THREE.Color(PALETTE.brass) },
      uScroll: { value: 0 },
      uTime: { value: 0 },
    },
    true,
  );

  const sparkMaterialA = createPointMaterial(
    SPARK_VERTEX,
    {
      uPixelRatio: { value: pixelRatio },
      uTime: { value: 0 },
    },
    false,
  );
  sparkMaterialA.uniforms.uTint = { value: new THREE.Color("#ffd1da") };
  const sparkMaterialB = createPointMaterial(
    SPARK_VERTEX,
    {
      uPixelRatio: { value: pixelRatio },
      uTime: { value: 0 },
    },
    false,
  );
  sparkMaterialB.uniforms.uTint = { value: new THREE.Color("#c9fff9") };

  const orbGeometry = new THREE.IcosahedronGeometry(0.13, lowQuality ? 1 : 3);
  const orbMaterials = Array.from(
    { length: ORB_COUNT },
    (_, index) =>
      new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? PALETTE.lime : PALETTE.brass,
        emissive: index % 2 === 0 ? PALETTE.lime : PALETTE.brass,
        emissiveIntensity: 0.5,
        metalness: 0.1,
        roughness: 0.35,
      }),
  );

  const ringGeometries = [5.4, 6.9, 8.6].map(
    (radius) =>
      new THREE.TorusGeometry(radius, 0.012, 6, lowQuality ? 120 : 220),
  );
  const ringMaterial = new THREE.MeshBasicMaterial({
    blending: THREE.AdditiveBlending,
    color: PALETTE.brass,
    depthWrite: false,
    opacity: 0.38,
    transparent: true,
  });
  const orbitTrackGeometry = new THREE.TorusGeometry(ORB_RADIUS, 0.008, 4, 160);
  orbitTrackGeometry.rotateX(Math.PI / 2);
  const orbitTrackMaterial = new THREE.MeshBasicMaterial({
    blending: THREE.AdditiveBlending,
    color: PALETTE.lime,
    depthWrite: false,
    opacity: 0.35,
    transparent: true,
  });

  const curves = {
    tall: {
      position: createCurve(HOME_TALL_POSITIONS),
      target: createCurve(HOME_TALL_TARGETS),
    },
    wide: {
      position: createCurve(HOME_WIDE_POSITIONS),
      target: createCurve(HOME_WIDE_TARGETS),
    },
  };

  const dispose = () => {
    for (const ribbon of [ribbonA, ribbonB]) {
      ribbon.geometry.dispose();
      ribbon.sparkGeometry.dispose();
      ribbon.material.dispose();
    }
    spanGeometry.dispose();
    spanMaterial.dispose();
    floorGeometry.dispose();
    floorMaterial.dispose();
    beamGeometry.dispose();
    beamMaterials.forEach((material) => material.dispose());
    particleGeometry.dispose();
    particleMaterial.dispose();
    sparkMaterialA.dispose();
    sparkMaterialB.dispose();
    orbGeometry.dispose();
    orbMaterials.forEach((material) => material.dispose());
    ringGeometries.forEach((geometry) => geometry.dispose());
    ringMaterial.dispose();
    orbitTrackGeometry.dispose();
    orbitTrackMaterial.dispose();
  };

  return {
    beamGeometry,
    beamMaterials,
    curves,
    dispose,
    floorGeometry,
    floorMaterial,
    orbGeometry,
    orbMaterials,
    orbitTrackGeometry,
    orbitTrackMaterial,
    particleGeometry,
    particleMaterial,
    ribbonA,
    ribbonB,
    ringGeometries,
    ringMaterial,
    spanAttribute,
    spanGeometry,
    spanMaterial,
    spanPositions,
    sparkMaterialA,
    sparkMaterialB,
  };
}

function CanvasLifecycle({
  onFailure,
  requestRenderRef,
}: Pick<StageSceneProps, "onFailure" | "requestRenderRef">) {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };

    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("tabindex", "-1");
    canvas.addEventListener("webglcontextlost", onContextLost, { once: true });
    requestRenderRef.current = invalidate;
    invalidate();

    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      if (requestRenderRef.current === invalidate) {
        requestRenderRef.current = null;
      }
    };
  }, [gl, invalidate, onFailure, requestRenderRef]);

  return null;
}

/* eslint-disable react-hooks/immutability -- R3F frame callbacks intentionally mutate Three.js buffers, uniforms and transforms. */
function StageWorld({
  active,
  input,
  lowQuality,
  onReady,
  variant,
}: Omit<StageSceneProps, "onFailure" | "requestRenderRef">) {
  const { camera, invalidate } = useThree();
  const resources = useMemo(
    () => createStageResources(lowQuality),
    [lowQuality],
  );
  const duet = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const beamPivots = useRef<(THREE.Group | null)[]>([]);
  const orbs = useRef<(THREE.Mesh | null)[]>([]);
  const rimA = useRef<THREE.PointLight>(null);
  const rimB = useRef<THREE.PointLight>(null);
  const frameTimer = useRef<number | null>(null);
  const clock = useRef({ phase: 0.08, settled: false, time: 0 });
  const lookTarget = useRef(new THREE.Vector3(-3, 0.05, 0));
  const readyReported = useRef(false);
  const scratch = useMemo(
    () => ({
      aim: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      pointer: new THREE.Vector3(),
      position: new THREE.Vector3(),
      target: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => () => resources.dispose(), [resources]);

  useEffect(() => {
    if (frameTimer.current !== null) {
      window.clearTimeout(frameTimer.current);
      frameTimer.current = null;
    }

    invalidate();
  }, [active, invalidate, resources, variant]);

  useEffect(
    () => () => {
      if (frameTimer.current !== null) {
        window.clearTimeout(frameTimer.current);
      }
    },
    [],
  );

  useFrame((state, delta) => {
    const step = clampKineticFrameDelta(delta);
    const timing = clock.current;

    if (active) {
      timing.time += step;
      timing.phase = advanceKineticPhase(timing.phase, step, "rock-n-roll");
    }

    const time = timing.time;
    const baseAngle = timing.phase * TAU;
    const choreographyPhase =
      (timing.phase +
        Math.sin(baseAngle * 2) * 0.009 +
        Math.sin(baseAngle * 4 + 0.45) * 0.003 +
        1) %
      1;
    const phraseAngle = choreographyPhase * TAU;
    const beat = choreographyPhase * ORB_COUNT;
    const count = Math.floor(beat) % ORB_COUNT;
    const beatPhase = beat - Math.floor(beat);
    const countPulse = Math.pow(0.5 + 0.5 * Math.cos(beatPhase * TAU), 3);
    const { hero, pointerX, pointerY, scroll } = input.current;
    const home = variant === "home";
    const dim = home ? THREE.MathUtils.clamp(hero * 0.85, 0, 1) : 0.8;
    const scrollProgress = THREE.MathUtils.clamp(scroll, 0, 1);

    writeKineticRibbonFrame(
      resources.ribbonA.buffers,
      choreographyPhase,
      -1,
      "rock-n-roll",
      resources.ribbonA.scratch,
    );
    writeKineticRibbonFrame(
      resources.ribbonB.buffers,
      choreographyPhase,
      1,
      "rock-n-roll",
      resources.ribbonB.scratch,
    );
    writeKineticSpanFrame(
      resources.spanPositions,
      choreographyPhase,
      "rock-n-roll",
    );
    resources.ribbonA.positionAttribute.needsUpdate = true;
    resources.ribbonA.normalAttribute.needsUpdate = true;
    resources.ribbonB.positionAttribute.needsUpdate = true;
    resources.ribbonB.normalAttribute.needsUpdate = true;
    resources.spanAttribute.needsUpdate = true;

    const ribbonGlow = (0.95 + countPulse * 0.55) * (1 - dim * 0.4);
    resources.ribbonA.material.emissiveIntensity = ribbonGlow;
    resources.ribbonB.material.emissiveIntensity = ribbonGlow;
    resources.spanMaterial.opacity =
      (0.36 + countPulse * 0.28) * (1 - dim * 0.35);

    const floorUniforms = resources.floorMaterial.uniforms;
    floorUniforms.uTime!.value = time;
    floorUniforms.uBeat!.value = beat;
    floorUniforms.uDim!.value = dim;
    resources.particleMaterial.uniforms.uBeat!.value = beat;
    resources.particleMaterial.uniforms.uDim!.value = dim;
    resources.particleMaterial.uniforms.uScroll!.value = scrollProgress;
    resources.particleMaterial.uniforms.uTime!.value = time;
    resources.sparkMaterialA.uniforms.uTime!.value = time;
    resources.sparkMaterialB.uniforms.uTime!.value = time;

    const aspect = state.size.width / Math.max(1, state.size.height);

    if (home) {
      const curves =
        aspect < 0.95 ? resources.curves.tall : resources.curves.wide;
      curves.position.getPoint(scrollProgress, scratch.position);
      curves.target.getPoint(scrollProgress, scratch.target);
    } else {
      const angle = time * 0.035 + scrollProgress * 1.4 + 0.6;
      const radius = aspect < 0.95 ? 17 : 13.5;
      scratch.position.set(
        Math.sin(angle) * radius,
        3.8 + scrollProgress * 3,
        Math.cos(angle) * radius,
      );
      scratch.target.set(0, -0.2, 0);
    }

    const cameraEnergy =
      (home ? 1 - dim * 0.7 : 0.38) * (lowQuality ? 0.68 : 1);
    scratch.position.x += Math.sin(phraseAngle) * 0.16 * cameraEnergy;
    scratch.position.y += Math.sin(phraseAngle * 2 + 0.7) * 0.08 * cameraEnergy;
    scratch.position.z += Math.cos(phraseAngle) * 0.12 * cameraEnergy;
    scratch.target.x += Math.sin(phraseAngle + 0.9) * 0.1 * cameraEnergy;
    scratch.target.y += Math.sin(phraseAngle * 2) * 0.055 * cameraEnergy;

    scratch.position.x += pointerX * 0.75;
    scratch.position.y += pointerY * 0.45;

    if (active && timing.settled) {
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        scratch.position.x,
        2.4,
        step,
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        scratch.position.y,
        2.4,
        step,
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        scratch.position.z,
        2.4,
        step,
      );
      lookTarget.current.x = THREE.MathUtils.damp(
        lookTarget.current.x,
        scratch.target.x,
        2.4,
        step,
      );
      lookTarget.current.y = THREE.MathUtils.damp(
        lookTarget.current.y,
        scratch.target.y,
        2.4,
        step,
      );
      lookTarget.current.z = THREE.MathUtils.damp(
        lookTarget.current.z,
        scratch.target.z,
        2.4,
        step,
      );
    } else {
      camera.position.copy(scratch.position);
      lookTarget.current.copy(scratch.target);
      timing.settled = true;
    }
    camera.lookAt(lookTarget.current);
    camera.rotateZ(
      Math.sin(phraseAngle - scrollProgress * 0.5) *
        THREE.MathUtils.degToRad(0.5) *
        cameraEnergy,
    );

    scratch.pointer.set(pointerX, pointerY, 0.5).unproject(camera);
    scratch.direction.copy(scratch.pointer).sub(camera.position).normalize();
    scratch.pointer
      .copy(camera.position)
      .addScaledVector(
        scratch.direction,
        camera.position.distanceTo(lookTarget.current),
      );
    (resources.particleMaterial.uniforms.uPointer!.value as THREE.Vector3).copy(
      scratch.pointer,
    );

    const beamStrength = home ? 1 - dim * 0.55 : 0.5;
    const pools = [
      floorUniforms.uPoolA,
      floorUniforms.uPoolB,
      floorUniforms.uPoolC,
    ];
    BEAMS.forEach((beam, index) => {
      const pivot = beamPivots.current[index];
      const material = resources.beamMaterials[index];
      const sway = time * beam.speed + beam.phase;
      scratch.aim.set(
        beam.aim[0] + Math.sin(sway) * beam.sway[0],
        FLOOR_Y,
        beam.aim[2] + Math.cos(sway * 0.8) * beam.sway[1],
      );
      pivot?.lookAt(scratch.aim);

      if (material) {
        material.uniforms.uTime!.value = time;
        material.uniforms.uIntensity!.value = beam.intensity * beamStrength;
      }

      (pools[index]?.value as THREE.Vector3 | undefined)?.set(
        scratch.aim.x,
        scratch.aim.z,
        beamStrength,
      );
    });

    orbs.current.forEach((orb, index) => {
      const material = resources.orbMaterials[index];

      if (!orb || !material) {
        return;
      }

      const energy = index === count ? 0.22 + countPulse * 0.78 : 0.08;
      orb.scale.setScalar(0.8 + energy * 0.9);
      orb.position.y = FLOOR_Y + 0.2 + energy * 0.25;
      material.emissiveIntensity = 0.35 + energy * 3.4;
    });

    if (rings.current) {
      rings.current.rotation.y = time * 0.04;
      rings.current.children.forEach((child, index) => {
        child.rotation.z = time * (0.05 + index * 0.025) * (index % 2 ? -1 : 1);
      });
    }

    if (duet.current) {
      const yaw = pointerX * THREE.MathUtils.degToRad(9);
      const pitch = -pointerY * THREE.MathUtils.degToRad(5);
      duet.current.rotation.y = active
        ? THREE.MathUtils.damp(duet.current.rotation.y, yaw, 4, step)
        : yaw;
      duet.current.rotation.x = active
        ? THREE.MathUtils.damp(duet.current.rotation.x, pitch, 4, step)
        : pitch;
      const roll =
        Math.sin(phraseAngle) *
        THREE.MathUtils.degToRad(1.15) *
        (1 - dim * 0.7);
      duet.current.rotation.z = active
        ? THREE.MathUtils.damp(duet.current.rotation.z, roll, 3.2, step)
        : roll;
      duet.current.position.y =
        Math.sin(phraseAngle * 2) * 0.035 + (countPulse - 0.5) * 0.025;
    }

    const pulse = countPulse * (1 - dim * 0.6);
    if (rimA.current) {
      rimA.current.intensity = 6 + pulse * 10;
    }
    if (rimB.current) {
      rimB.current.intensity = 5 + pulse * 8;
    }

    if (!readyReported.current) {
      readyReported.current = true;
      onReady();
    }

    if (active && frameTimer.current === null) {
      frameTimer.current = window.setTimeout(
        () => {
          frameTimer.current = null;
          state.invalidate();
        },
        lowQuality
          ? LOW_QUALITY_FRAME_INTERVAL_MS
          : HIGH_QUALITY_FRAME_INTERVAL_MS,
      );
    }
  });

  return (
    <>
      <hemisphereLight args={["#7d8bc4", "#0b0710", 0.5]} />
      <directionalLight color="#fff1dc" intensity={1.6} position={[4, 6, 7]} />
      <spotLight
        angle={0.55}
        castShadow={!lowQuality}
        color="#fff4e0"
        decay={0}
        intensity={2.2}
        penumbra={0.85}
        position={[0.6, 9.5, 3.2]}
        shadow-bias={-0.0005}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        ref={rimA}
        color={PALETTE.coral}
        decay={1.6}
        distance={14}
        intensity={8}
        position={[-3.2, 1.4, 2.6]}
      />
      <pointLight
        ref={rimB}
        color={PALETTE.teal}
        decay={1.6}
        distance={14}
        intensity={6}
        position={[3.4, 0.6, 2.2]}
      />

      <mesh
        geometry={resources.floorGeometry}
        material={resources.floorMaterial}
        position={[0, FLOOR_Y, 0]}
        renderOrder={-1}
      />
      {lowQuality ? null : (
        <mesh
          position={[0, FLOOR_Y + 0.015, 0]}
          receiveShadow
          rotation-x={-Math.PI / 2}
        >
          <planeGeometry args={[18, 18]} />
          <shadowMaterial opacity={0.5} transparent />
        </mesh>
      )}

      <group ref={duet} scale={1.18}>
        <mesh
          castShadow={!lowQuality}
          frustumCulled={false}
          geometry={resources.ribbonA.geometry}
          material={resources.ribbonA.material}
        />
        <mesh
          castShadow={!lowQuality}
          frustumCulled={false}
          geometry={resources.ribbonB.geometry}
          material={resources.ribbonB.material}
        />
        <points
          frustumCulled={false}
          geometry={resources.ribbonA.sparkGeometry}
          material={resources.sparkMaterialA}
        />
        <points
          frustumCulled={false}
          geometry={resources.ribbonB.sparkGeometry}
          material={resources.sparkMaterialB}
        />
        <lineSegments
          frustumCulled={false}
          geometry={resources.spanGeometry}
          material={resources.spanMaterial}
        />
      </group>

      <mesh
        geometry={resources.orbitTrackGeometry}
        material={resources.orbitTrackMaterial}
        position={[0, FLOOR_Y + 0.2, 0]}
      />
      {Array.from({ length: ORB_COUNT }, (_, index) => {
        const angle = (index / ORB_COUNT) * Math.PI * 2 - Math.PI / 2;
        const material = resources.orbMaterials[index];

        return material ? (
          <mesh
            key={index}
            ref={(node) => {
              orbs.current[index] = node;
            }}
            geometry={resources.orbGeometry}
            material={material}
            position={[
              Math.cos(angle) * ORB_RADIUS,
              FLOOR_Y + 0.2,
              Math.sin(angle) * ORB_RADIUS,
            ]}
          />
        ) : null;
      })}

      <group ref={rings} position={[0, 0.3, 0]}>
        {resources.ringGeometries.map((geometry, index) => (
          <mesh
            key={index}
            geometry={geometry}
            material={resources.ringMaterial}
            rotation={[Math.PI / 2 + (index - 1) * 0.42, index * 0.6, 0]}
          />
        ))}
      </group>

      {BEAMS.map((beam, index) => {
        const material = resources.beamMaterials[index];

        return material ? (
          <group
            key={beam.colour}
            ref={(node) => {
              beamPivots.current[index] = node;
            }}
            position={[...beam.origin]}
          >
            <mesh
              frustumCulled={false}
              geometry={resources.beamGeometry}
              material={material}
            />
          </group>
        ) : null;
      })}

      <points
        frustumCulled={false}
        geometry={resources.particleGeometry}
        material={resources.particleMaterial}
      />
    </>
  );
}
/* eslint-enable react-hooks/immutability */

export default function StageScene(props: StageSceneProps) {
  const dpr: [number, number] = props.lowQuality ? [1, 1.25] : [1, 1.75];

  return (
    <Canvas
      aria-hidden="true"
      camera={{ far: 90, fov: 38, near: 0.1, position: [-2.7, 0.5, 10.4] }}
      dpr={dpr}
      frameloop="demand"
      gl={{
        alpha: false,
        antialias: !props.lowQuality,
        depth: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        stencil: false,
      }}
      onCreated={({ gl, scene }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = new THREE.Color(PALETTE.void);
        scene.fog = new THREE.FogExp2(PALETTE.void, 0.03);
      }}
      shadows={props.lowQuality ? false : "percentage"}
      style={{
        height: "100%",
        inset: 0,
        pointerEvents: "none",
        position: "absolute",
        width: "100%",
      }}
      tabIndex={-1}
    >
      <CanvasLifecycle
        onFailure={props.onFailure}
        requestRenderRef={props.requestRenderRef}
      />
      <StageWorld
        active={props.active}
        input={props.input}
        lowQuality={props.lowQuality}
        onReady={props.onReady}
        variant={props.variant}
      />
    </Canvas>
  );
}
