"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

import {
  advanceKineticPhase,
  clampKineticFrameDelta,
  createKineticPhraseRailPositions,
  createKineticRibbonBuffers,
  createKineticRibbonScratch,
  createKineticSpanPositions,
  writeKineticRibbonFrame,
  writeKineticSpanFrame,
} from "@/components/three/kinetic-duet-geometry";
import type {
  KineticDiscipline,
  KineticDuetFailure,
} from "@/types/kinetic-duet";

type KineticPointer = {
  x: number;
  y: number;
};

type KineticColours = {
  brass: string;
  partnerA: string;
  partnerB: string;
};

type KineticDuetCanvasProps = {
  active: boolean;
  colours: KineticColours;
  discipline: KineticDiscipline;
  lowQuality: boolean;
  onFailure: (
    reason: Extract<KineticDuetFailure, "context-lost" | "load-error">,
  ) => void;
  onReady: (() => void) | undefined;
  pointer: MutableRefObject<KineticPointer>;
  requestRenderRef: MutableRefObject<(() => void) | null>;
  showPhraseRail: boolean;
};

type RibbonResource = {
  buffers: ReturnType<typeof createKineticRibbonBuffers>;
  geometry: THREE.BufferGeometry;
  normalAttribute: THREE.BufferAttribute;
  positionAttribute: THREE.BufferAttribute;
  scratch: ReturnType<typeof createKineticRibbonScratch>;
};

function createRibbonResource(segments: number): RibbonResource {
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

  return {
    buffers,
    geometry,
    normalAttribute,
    positionAttribute,
    scratch: createKineticRibbonScratch(),
  };
}

function createLineGeometry(positions: Float32Array, dynamic = false) {
  const geometry = new THREE.BufferGeometry();
  const attribute = new THREE.BufferAttribute(positions, 3);

  if (dynamic) {
    attribute.setUsage(THREE.DynamicDrawUsage);
  }

  geometry.setAttribute("position", attribute);
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4.5);

  return { attribute, geometry, positions };
}

function RendererFallback({
  onFailure,
}: Pick<KineticDuetCanvasProps, "onFailure">) {
  useEffect(() => {
    onFailure("load-error");
  }, [onFailure]);

  return null;
}

function CanvasLifecycle({
  onFailure,
  requestRenderRef,
}: Pick<KineticDuetCanvasProps, "onFailure" | "requestRenderRef">) {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      onFailure("context-lost");
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

/* eslint-disable react-hooks/immutability -- R3F frame callbacks intentionally update Three.js buffers and transforms. */
function KineticSculpture({
  active,
  colours,
  discipline,
  lowQuality,
  onReady,
  pointer,
  showPhraseRail,
}: Omit<KineticDuetCanvasProps, "onFailure" | "requestRenderRef">) {
  const rotatingGroup = useRef<THREE.Group>(null);
  const phase = useRef(0.08);
  const readyReported = useRef(false);
  const { invalidate, viewport } = useThree();
  const segments = lowQuality ? 72 : 128;
  const scale = Math.min(1, viewport.width / 7.4);

  const resources = useMemo(() => {
    const ribbonA = createRibbonResource(segments);
    const ribbonB = createRibbonResource(segments);
    const spans = createLineGeometry(createKineticSpanPositions(), true);
    const rail = createLineGeometry(createKineticPhraseRailPositions());
    const torus = new THREE.TorusGeometry(
      0.11,
      0.018,
      lowQuality ? 6 : 8,
      lowQuality ? 24 : 40,
    );
    const materialA = new THREE.MeshPhysicalMaterial({
      clearcoat: 0.28,
      clearcoatRoughness: 0.46,
      color: colours.partnerA,
      emissive: colours.partnerA,
      emissiveIntensity: 0.06,
      metalness: 0.08,
      roughness: 0.34,
      side: THREE.DoubleSide,
    });
    const materialB = new THREE.MeshPhysicalMaterial({
      clearcoat: 0.28,
      clearcoatRoughness: 0.46,
      color: colours.partnerB,
      emissive: colours.partnerB,
      emissiveIntensity: 0.06,
      metalness: 0.08,
      roughness: 0.34,
      side: THREE.DoubleSide,
    });
    const brassLineMaterial = new THREE.LineBasicMaterial({
      color: colours.brass,
      opacity: 0.5,
      transparent: true,
    });
    const brassRingMaterial = new THREE.MeshStandardMaterial({
      color: colours.brass,
      metalness: 0.05,
      roughness: 0.48,
    });

    return {
      brassLineMaterial,
      brassRingMaterial,
      materialA,
      materialB,
      rail,
      ribbonA,
      ribbonB,
      spans,
      torus,
    };
  }, [colours.brass, colours.partnerA, colours.partnerB, lowQuality, segments]);

  useEffect(
    () => () => {
      resources.ribbonA.geometry.dispose();
      resources.ribbonB.geometry.dispose();
      resources.spans.geometry.dispose();
      resources.rail.geometry.dispose();
      resources.torus.dispose();
      resources.materialA.dispose();
      resources.materialB.dispose();
      resources.brassLineMaterial.dispose();
      resources.brassRingMaterial.dispose();
    },
    [resources],
  );

  useEffect(() => {
    invalidate();
  }, [active, discipline, invalidate, resources, showPhraseRail]);

  useFrame((state, delta) => {
    const safeDelta = clampKineticFrameDelta(delta);

    if (active) {
      phase.current = advanceKineticPhase(phase.current, safeDelta, discipline);
    }

    writeKineticRibbonFrame(
      resources.ribbonA.buffers,
      phase.current,
      -1,
      discipline,
      resources.ribbonA.scratch,
    );
    writeKineticRibbonFrame(
      resources.ribbonB.buffers,
      phase.current,
      1,
      discipline,
      resources.ribbonB.scratch,
    );
    writeKineticSpanFrame(resources.spans.positions, phase.current, discipline);

    resources.ribbonA.positionAttribute.needsUpdate = true;
    resources.ribbonA.normalAttribute.needsUpdate = true;
    resources.ribbonB.positionAttribute.needsUpdate = true;
    resources.ribbonB.normalAttribute.needsUpdate = true;
    resources.spans.attribute.needsUpdate = true;

    if (rotatingGroup.current) {
      const targetYaw = pointer.current.x * THREE.MathUtils.degToRad(4);
      const targetPitch = -pointer.current.y * THREE.MathUtils.degToRad(2.5);

      if (active) {
        rotatingGroup.current.rotation.y = THREE.MathUtils.damp(
          rotatingGroup.current.rotation.y,
          targetYaw,
          8,
          safeDelta,
        );
        rotatingGroup.current.rotation.x = THREE.MathUtils.damp(
          rotatingGroup.current.rotation.x,
          targetPitch,
          8,
          safeDelta,
        );
      } else {
        rotatingGroup.current.rotation.y = targetYaw;
        rotatingGroup.current.rotation.x = targetPitch;
      }
    }

    if (!readyReported.current) {
      readyReported.current = true;
      onReady?.();
    }

    if (active) {
      state.invalidate();
    }
  });

  return (
    <>
      <hemisphereLight args={["#8795ba", "#120f12", 0.55]} />
      <directionalLight color="#fff0d8" intensity={2.6} position={[4, 5, 7]} />
      <directionalLight
        color="#7890d8"
        intensity={1.15}
        position={[-4, 1, 4]}
      />
      <group scale={scale}>
        <group ref={rotatingGroup}>
          <mesh
            frustumCulled={false}
            geometry={resources.ribbonA.geometry}
            material={resources.materialA}
          />
          <mesh
            frustumCulled={false}
            geometry={resources.ribbonB.geometry}
            material={resources.materialB}
          />
          <lineSegments
            frustumCulled={false}
            geometry={resources.spans.geometry}
            material={resources.brassLineMaterial}
          />
          {showPhraseRail ? (
            <lineSegments
              frustumCulled={false}
              geometry={resources.rail.geometry}
              material={resources.brassLineMaterial}
            />
          ) : null}
          <mesh
            geometry={resources.torus}
            material={resources.brassRingMaterial}
          />
        </group>
      </group>
    </>
  );
}
/* eslint-enable react-hooks/immutability */

export default function KineticDuetCanvas(props: KineticDuetCanvasProps) {
  const dpr: [number, number] = props.lowQuality ? [1, 1.15] : [1, 1.5];

  return (
    <Canvas
      aria-hidden="true"
      camera={{
        far: 20,
        fov: 34,
        near: 0.1,
        position: [0, 0.18, 8.7],
      }}
      dpr={dpr}
      fallback={<RendererFallback onFailure={props.onFailure} />}
      frameloop="demand"
      gl={{
        alpha: true,
        antialias: !props.lowQuality,
        depth: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        stencil: false,
      }}
      onCreated={({ camera, gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
        gl.setClearColor(0x000000, 0);
        camera.lookAt(0, 0, 0);
      }}
      style={{
        height: "100%",
        inset: 0,
        pointerEvents: "none",
        position: "absolute",
        width: "100%",
        zIndex: 1,
      }}
      tabIndex={-1}
    >
      <CanvasLifecycle
        onFailure={props.onFailure}
        requestRenderRef={props.requestRenderRef}
      />
      <KineticSculpture
        active={props.active}
        colours={props.colours}
        discipline={props.discipline}
        lowQuality={props.lowQuality}
        onReady={props.onReady}
        pointer={props.pointer}
        showPhraseRail={props.showPhraseRail}
      />
    </Canvas>
  );
}
