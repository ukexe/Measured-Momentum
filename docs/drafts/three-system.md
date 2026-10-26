# Saath Rekha — kinetic duet system

Status: implementation proposal  
Target: React 19, current `@react-three/fiber` 9.x, and its compatible current `three` release

## Direction

**Saath Rekha** (“lines together”) is an internal name for the visual system, not a proposed organisation name. Two equal-width ribbons describe two dancers’ trajectories around a shared path. Thin spans periodically join them, making timing, counterbalance, and recovery visible. Neither ribbon is permanently the lead, and neither is coded by gender.

The result should feel like a precisely rehearsed duet: athletic, warm, and premium, without pretending to show literal technique. It should not use blobs, particle fields, floating trophies, stock silhouettes, flags, or a large 3D model.

Recommended adjacent copy:

> A proposed independent organisation supporting Acrobatic Rock ’n’ Roll and Boogie Woogie in India.

Until the organisation has documented recognition, the site must not say or imply “official,” “national governing body,” “federation of India,” selection authority, or affiliation. Do not use the State Emblem of India, federation marks, medals, or national-team styling. The motion is an identity device, not coaching or safety guidance.

## Composition

The sculpture occupies a wide 16:9 or 3:2 hero window over a dark ink ground.

| Element | Geometry | Purpose |
| --- | --- | --- |
| Partner ribbon A | Dynamic indexed strip, 128 longitudinal segments, 0.12 world-unit width | First trajectory |
| Partner ribbon B | Same geometry and visual weight | Second trajectory |
| Coordination spans | 6–8 short line segments joining the two centre paths | Makes partnership and shared timing explicit |
| Phrase rail | One quiet horizontal line with six unlabelled ticks | Gives the motion a measured baseline without claiming instructional counts |
| Shared fulcrum | Small open torus at the centre, never filled | Marks the exchange point |

Each ribbon has 258 vertices and 256 triangles at full quality. The complete scene should stay below 2,000 visible triangles and 9 draw calls. There are no textures, imported models, particles, shadows, post-processing passes, or environment maps.

### Path construction

Let `t` run from `0` to `1` along the hero. Both partners share the same forward axis:

```text
x = (t - 0.5) × 6.8
wave envelope = sin(πt)
shared = low-amplitude travelling wave
partner offset = equal and opposite rotating vector × (0.22 + 0.78 × envelope)
```

The wave envelope returns the shared motion to the baseline at either edge. A 22% residual partner offset keeps the surfaces apart there. The opposite offsets preserve equal visual importance, while their depth ordering exchanges near the centre.

The strip geometry is updated in one frame callback from typed arrays. For every path sample:

1. Evaluate the centre point and a nearby point.
2. Derive the tangent.
3. Cross the tangent with the view axis to obtain a strip-side vector.
4. Add a small, bounded twist around the tangent.
5. Write left/right positions and a shared face normal.

This is inexpensive at this vertex count and permits standard physically based materials; it also avoids a custom shader tied to private Three.js chunks.

### Materials

- Ribbon A: lacquer vermilion `#d86543`
- Ribbon B: peacock indigo `#526cc7`
- Coordination spans and fulcrum: muted brass `#c7a66a`
- Ground: ink `#080b12`
- Supporting text: warm ivory `#f2eadc`

Both ribbons use the same `MeshPhysicalMaterial` settings:

```ts
{
  metalness: 0.08,
  roughness: 0.34,
  clearcoat: 0.28,
  clearcoatRoughness: 0.46,
  emissiveIntensity: 0.06,
  side: THREE.DoubleSide
}
```

The colour pairing is not a flag treatment and should not be described as representing all of India. Product pages may override the colours, but contrast and equal luminance should be retained.

### Lighting and colour

- Warm key: directional light at `[4, 5, 7]`, `#fff0d8`, intensity `2.6`
- Cool rim: directional light at `[-4, 1, 4]`, `#7890d8`, intensity `1.15`
- Hemisphere fill: sky `#8795ba`, ground `#120f12`, intensity `0.55`
- ACES filmic tone mapping, exposure `1.0`, sRGB output
- No cast or receive shadows

The dark page background remains visible through the alpha canvas. A faint CSS radial gradient behind the canvas provides the “pool of light,” so WebGL does not spend a draw call on a floor plane.

### Camera

- Perspective camera: position `[0, 0.18, 8.7]`
- Field of view: `34°`
- Near/far: `0.1 / 20`
- Look-at: `[0, 0, 0]`
- Scene scale: `1` when viewport width at the origin is at least `7.4`; otherwise `viewport.width / 7.4`

The camera itself does not move. Pointer response rotates the sculpture group by at most `4°` yaw and `2.5°` pitch, which preserves the composition and avoids motion sickness.

## Motion language

One visual phrase loops in `6.4s`. It is deliberately not labelled as a dance count or instructional footwork.

| Phrase | Loop range | Visual action |
| --- | ---: | --- |
| Establish | 0–16% | Paths approach with restrained, mirrored lateral motion |
| Counterbalance | 16–38% | The offset vector opens; spans become visually longer |
| Exchange | 38–58% | Ribbons trade front/back ordering at the fulcrum |
| Elevate | 58–78% | One path rises while the other anchors; roles reverse next loop |
| Recover | 78–100% | Energy narrows and returns continuously to the opening pose |

Motion is generated from periodic sine harmonics rather than a collection of unrelated tweens. The phase increments from clamped frame delta, not wall-clock time, so returning from a hidden tab resumes rather than jumping.

### Discipline variants

The variants alter one path generator; they do not swap entire scenes.

```ts
type Discipline = 'boogie' | 'rock-n-roll' | 'acro';

const disciplinePreset = {
  boogie: {
    duration: 5.6,
    vertical: 0.34,
    depth: 0.42,
    separation: 0.31,
    harmonic: 3,
    note: 'Grounded lateral pulse and compact braided exchange',
  },
  'rock-n-roll': {
    duration: 4.9,
    vertical: 0.60,
    depth: 0.50,
    separation: 0.38,
    harmonic: 2,
    note: 'Sharper diagonals and a quicker recover',
  },
  acro: {
    duration: 6.8,
    vertical: 0.92,
    depth: 0.56,
    separation: 0.42,
    harmonic: 1,
    note: 'One clear supported lift arc, then an unhurried recovery',
  },
} as const;
```

`acro` remains abstract. It must not depict a named trick, imply safe execution, or replace qualified coaching.

### Pointer and controls

- Read pointer coordinates from the outer DOM figure; do not raycast the meshes.
- Normalize to `[-1, 1]`, clamp, and damp toward the target over roughly `220ms`.
- Apply only group yaw/pitch and at most an 8% change in wave energy.
- On pointer exit, damp to neutral.
- Disable pointer response for coarse pointers and reduced motion.
- Do not capture touch or interfere with vertical scrolling.
- Do not make the canvas a keyboard stop. Discipline and pause controls are normal HTML buttons outside it.
- Because the loop lasts longer than five seconds, include a visible “Pause motion” / “Play motion” control whenever animation autoplays. Pause is remembered for the session.

No information or navigation may depend on manipulating the sculpture.

## Public component API

Keep the public API small and semantic:

```ts
export type KineticDuetProps = {
  discipline?: 'boogie' | 'rock-n-roll' | 'acro';
  motion?: 'auto' | 'still';
  quality?: 'auto' | 'low' | 'high';
  label?: string;
  className?: string;
  showPhraseRail?: boolean;
  palette?: Partial<{
    partnerA: string;
    partnerB: string;
    brass: string;
    ground: string;
  }>;
  onReady?: () => void;
  onFailure?: (reason: 'unsupported' | 'context-lost' | 'load-error') => void;
};
```

Defaults:

```ts
{
  discipline: 'rock-n-roll',
  motion: 'auto',
  quality: 'auto',
  label: 'Two woven ribbons trace a coordinated partner dance: they counterbalance, exchange height, and recover together.',
  showPhraseRail: true
}
```

`motion="still"` always wins. `motion="auto"` still respects system reduced-motion and the user’s pause control; there is no API that silently overrides `prefers-reduced-motion`.

## Concrete React Three Fiber sketch

The following is a structural implementation sketch. Split it into a lightweight DOM shell and a lazy 3D module in production.

### Lightweight shell

```tsx
import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type ErrorInfo,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';

const LazyDuetCanvas = lazy(() => import('./KineticDuetCanvas'));

class DuetErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

function hasUsableWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', {
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'high-performance',
    });
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function useViewportState(root: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const node = root.current;
    if (!node) return;

    const nearObserver = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: '280px 0px' },
    );
    const visibleObserver = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.12),
      { threshold: [0, 0.12] },
    );

    nearObserver.observe(node);
    visibleObserver.observe(node);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, [root]);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  return { near, visible, pageVisible };
}

export function KineticDuet({
  discipline = 'rock-n-roll',
  motion = 'auto',
  quality = 'auto',
  label = 'Two woven ribbons trace a coordinated partner dance: they counterbalance, exchange height, and recover together.',
  className,
  onReady,
  onFailure,
}: KineticDuetProps) {
  const root = useRef<HTMLElement>(null);
  const descriptionId = useId();
  const pointer = useRef({ x: 0, y: 0 });
  const { near, visible, pageVisible } = useViewportState(root);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const coarse = useMedia('(pointer: coarse)');
  const [supported, setSupported] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setSupported(hasUsableWebGL2());
  }, []);

  useEffect(() => {
    try {
      setPaused(sessionStorage.getItem('duet-motion') === 'paused');
    } catch {
      // Storage may be blocked; the in-memory pause control still works.
    }
  }, []);

  useEffect(() => {
    if (supported === false) onFailure?.('unsupported');
  }, [onFailure, supported]);

  const saveData =
    typeof navigator !== 'undefined' &&
    Boolean((navigator as Navigator & {
      connection?: { saveData?: boolean };
    }).connection?.saveData);

  const mayLoad =
    near && supported === true && !failed && !reduced && !saveData;
  const active =
    mayLoad && visible && pageVisible && motion === 'auto' && !paused;

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (coarse || reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointer.current.x = Math.max(-1, Math.min(1, x));
    pointer.current.y = Math.max(-1, Math.min(1, y));
  };

  const pause = () => {
    const next = !paused;
    setPaused(next);
    try {
      sessionStorage.setItem('duet-motion', next ? 'paused' : 'playing');
    } catch {
      // Do not make storage availability a requirement for pausing.
    }
  };

  return (
    <figure
      ref={root}
      className={['kinetic-duet', className].filter(Boolean).join(' ')}
      aria-labelledby={descriptionId}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        pointer.current.x = 0;
        pointer.current.y = 0;
      }}
    >
      <StaticDuet aria-hidden="true" />

      {mayLoad && (
        <DuetErrorBoundary
          onError={() => {
            setFailed(true);
            onFailure?.('load-error');
          }}
        >
          <Suspense fallback={null}>
            <LazyDuetCanvas
              active={active}
              discipline={discipline}
              quality={quality}
              pointer={pointer}
              onReady={onReady}
              onFailure={(reason) => {
                setFailed(true);
                onFailure?.(reason);
              }}
            />
          </Suspense>
        </DuetErrorBoundary>
      )}

      <figcaption id={descriptionId} className="sr-only">
        {label} This decorative visual represents partnership and is not an
        instructional demonstration.
      </figcaption>

      {mayLoad && motion === 'auto' && !reduced && (
        <button className="kinetic-duet__pause" type="button" onClick={pause}>
          {paused ? 'Play motion' : 'Pause motion'}
        </button>
      )}
    </figure>
  );
}
```

The shell renders the same fallback-first structure on the server and initial client pass. Browser-only capability, media, observer, and storage work begins in effects.

### Canvas and scene

```tsx
import {
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type Point = { x: number; y: number };

type CanvasProps = {
  active: boolean;
  discipline: Discipline;
  quality: 'auto' | 'low' | 'high';
  pointer: MutableRefObject<Point>;
  onReady?: () => void;
  onFailure?: (reason: 'context-lost' | 'load-error') => void;
};

const TAU = Math.PI * 2;

function evaluateCentre(
  out: THREE.Vector3,
  t: number,
  phase: number,
  partner: -1 | 1,
  discipline: Discipline,
) {
  const preset = disciplinePreset[discipline];
  const envelope = Math.sin(Math.PI * t);
  const q = TAU * (t + phase);
  const orbit = preset.separation * (0.22 + 0.78 * envelope);
  const sharedY =
    preset.vertical * envelope * (0.72 * Math.sin(q) +
      0.12 * Math.sin(preset.harmonic * q));
  const sharedZ =
    preset.depth * envelope * 0.34 * Math.sin(2 * q);
  const lift =
    discipline === 'acro'
      ? 0.34 * envelope * Math.max(0, Math.sin(q)) ** 2
      : 0;

  out.set(
    (t - 0.5) * 6.8,
    sharedY + lift + partner * orbit * Math.cos(q + 0.38),
    sharedZ + partner * orbit * Math.sin(q + 0.38),
  );
  return out;
}

function createRibbonGeometry(segments: number) {
  const vertexCount = (segments + 1) * 2;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = new Uint16Array(segments * 6);

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    uvs.set([t, 0, t, 1], i * 4);
    if (i < segments) {
      const v = i * 2;
      indices.set([v, v + 2, v + 1, v + 2, v + 3, v + 1], i * 6);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4.5);
  return geometry;
}

function PartnerRibbon({
  partner,
  colour,
  phase,
  discipline,
  segments,
}: {
  partner: -1 | 1;
  colour: string;
  phase: MutableRefObject<number>;
  discipline: Discipline;
  segments: number;
}) {
  const geometry = useMemo(() => createRibbonGeometry(segments), [segments]);
  const scratch = useMemo(
    () => ({
      centre: new THREE.Vector3(),
      before: new THREE.Vector3(),
      after: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      side: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      view: new THREE.Vector3(0, 0, 1),
    }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const position = geometry.getAttribute('position') as THREE.BufferAttribute;
    const normal = geometry.getAttribute('normal') as THREE.BufferAttribute;
    const epsilon = 1 / segments;

    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      evaluateCentre(scratch.centre, t, phase.current, partner, discipline);
      evaluateCentre(
        scratch.before,
        Math.max(0, t - epsilon),
        phase.current,
        partner,
        discipline,
      );
      evaluateCentre(
        scratch.after,
        Math.min(1, t + epsilon),
        phase.current,
        partner,
        discipline,
      );

      scratch.tangent.subVectors(scratch.after, scratch.before).normalize();
      scratch.side.crossVectors(scratch.tangent, scratch.view).normalize();
      scratch.side.applyAxisAngle(
        scratch.tangent,
        0.18 * Math.sin(TAU * (t + phase.current)),
      );
      scratch.normal.crossVectors(scratch.side, scratch.tangent).normalize();

      for (const sideSign of [-1, 1] as const) {
        const vertex = i * 2 + (sideSign === -1 ? 0 : 1);
        const offset = 0.06 * sideSign;
        position.setXYZ(
          vertex,
          scratch.centre.x + scratch.side.x * offset,
          scratch.centre.y + scratch.side.y * offset,
          scratch.centre.z + scratch.side.z * offset,
        );
        normal.setXYZ(
          vertex,
          scratch.normal.x,
          scratch.normal.y,
          scratch.normal.z,
        );
      }
    }

    position.needsUpdate = true;
    normal.needsUpdate = true;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <meshPhysicalMaterial
        color={colour}
        emissive={colour}
        emissiveIntensity={0.06}
        metalness={0.08}
        roughness={0.34}
        clearcoat={0.28}
        clearcoatRoughness={0.46}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function ResponsiveGroup({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const scale = Math.min(1, viewport.width / 7.4);

  return (
    <group ref={group} scale={scale}>
      {children}
    </group>
  );
}

function DuetScene({
  active,
  discipline,
  pointer,
  segments,
}: Pick<CanvasProps, 'active' | 'discipline' | 'pointer'> & {
  segments: number;
}) {
  const group = useRef<THREE.Group>(null);
  const phase = useRef(0.08);

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 1 / 20);
    if (active) {
      phase.current =
        (phase.current + safeDelta / disciplinePreset[discipline].duration) % 1;
    }

    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        pointer.current.x * THREE.MathUtils.degToRad(4),
        8,
        safeDelta,
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        -pointer.current.y * THREE.MathUtils.degToRad(2.5),
        8,
        safeDelta,
      );
    }
  });

  return (
    <>
      <hemisphereLight args={['#8795ba', '#120f12', 0.55]} />
      <directionalLight position={[4, 5, 7]} color="#fff0d8" intensity={2.6} />
      <directionalLight position={[-4, 1, 4]} color="#7890d8" intensity={1.15} />
      <ResponsiveGroup>
        <group ref={group}>
          <PartnerRibbon
            partner={-1}
            colour="#d86543"
            phase={phase}
            discipline={discipline}
            segments={segments}
          />
          <PartnerRibbon
            partner={1}
            colour="#526cc7"
            phase={phase}
            discipline={discipline}
            segments={segments}
          />
          <CoordinationSpans phase={phase} discipline={discipline} />
          <PhraseRail />
          <mesh>
            <torusGeometry args={[0.11, 0.018, 8, 40]} />
            <meshStandardMaterial color="#c7a66a" roughness={0.48} />
          </mesh>
        </group>
      </ResponsiveGroup>
    </>
  );
}

export default function KineticDuetCanvas(props: CanvasProps) {
  const coarse = matchMedia('(pointer: coarse)').matches;
  // Coarse/mobile limits are hard caps; `high` does not override them.
  const low = props.quality === 'low' || coarse;
  const dpr: [number, number] = low ? [1, 1.15] : [1, 1.5];

  return (
    <Canvas
      className="kinetic-duet__canvas"
      aria-hidden="true"
      camera={{ position: [0, 0.18, 8.7], fov: 34, near: 0.1, far: 20 }}
      dpr={dpr}
      frameloop={props.active ? 'always' : 'demand'}
      gl={{
        alpha: true,
        antialias: !low,
        depth: true,
        stencil: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl, invalidate }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;

        const lost = (event: Event) => {
          event.preventDefault();
          props.onFailure?.('context-lost');
        };
        gl.domElement.addEventListener('webglcontextlost', lost, { once: true });
        invalidate();
        props.onReady?.();
      }}
    >
      <DuetScene
        active={props.active}
        discipline={props.discipline}
        pointer={props.pointer}
        segments={low ? 72 : 128}
      />
    </Canvas>
  );
}
```

`CoordinationSpans` should own one six-segment `BufferGeometry`, evaluate both centre paths at fixed values such as `[0.16, 0.29, 0.42, 0.58, 0.71, 0.84]`, and update its 12 positions in the same frame. `PhraseRail` is one static `LineSegments` geometry. In the final implementation, consolidate phase, ribbon, and span writes into one prioritized `useFrame` callback to make update order explicit.

When `active` changes from false to true, call R3F’s `invalidate()` once if the selected renderer does not restart immediately. Dispose every manually created geometry and material on unmount. Remove the context-loss listener in production by retaining its callback and cleaning it up.

## Lazy loading and lifecycle

The DOM shell and fallback are server-renderable. `three`, R3F, and the scene module enter a separate deferred chunk.

1. Render the static fallback immediately.
2. On the client, test for a usable WebGL2 context.
3. A preload observer with `rootMargin: 280px` may mount the lazy canvas shortly before it enters view.
4. A second observer marks it active only at `12%` intersection.
5. Set the canvas to `frameloop="demand"` when offscreen, paused, or in a hidden document.
6. Resume from the stored phase when visible again; do not derive phase from `Date.now()`.
7. If `Save-Data` or reduced motion is active, do not fetch the 3D chunk. Keep the complete static visual.
8. If module loading, renderer creation, or context retention fails, remove the canvas and leave the fallback. Do not retry in a loop.

The capability probe is advisory. The real renderer remains wrapped by an error boundary so construction errors also resolve to the fallback. WebGL context loss should call `preventDefault`, stop animation, and show the fallback; provide an explicit “Retry 3D visual” action only if user research shows it is useful.

## Static SVG fallback

Keep the fallback mounted under the transparent canvas to avoid blank frames during loading or context loss.

```tsx
export function StaticDuet(props: { 'aria-hidden'?: 'true' }) {
  const id = `duet-${useId().replace(/:/g, '')}`;

  return (
    <svg
      className="kinetic-duet__poster"
      viewBox="0 0 800 360"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      {...props}
    >
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#873c34" />
          <stop offset=".5" stopColor="#e2764e" />
          <stop offset="1" stopColor="#873c34" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#344786" />
          <stop offset=".5" stopColor="#6f83dc" />
          <stop offset="1" stopColor="#344786" />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round">
        <path
          d="M72 214 C174 84 254 78 338 176 S514 292 728 138"
          stroke={`url(#${id}-a)`}
          strokeWidth="12"
        />
        <path
          d="M72 146 C174 276 254 282 338 184 S514 68 728 222"
          stroke={`url(#${id}-b)`}
          strokeWidth="12"
        />
        <g stroke="#c7a66a" strokeOpacity=".34" strokeWidth="2">
          <path d="M168 95 L168 265" />
          <path d="M266 93 L266 267" />
          <path d="M350 168 L350 192" />
          <path d="M450 248 L450 112" />
          <path d="M552 268 L552 92" />
          <path d="M648 218 L648 142" />
        </g>
        <path d="M128 310 H672" stroke="#c7a66a" strokeOpacity=".25" />
      </g>
    </svg>
  );
}
```

The `useId()` prefix keeps gradient references instance-safe when multiple sculptures appear on one page.

## CSS-only fallback

If inline SVG is removed by a content pipeline, the same shell can retain the art direction with two bordered arcs. It is intentionally static.

```html
<div class="duet-css" aria-hidden="true">
  <span class="duet-css__ribbon duet-css__ribbon--a"></span>
  <span class="duet-css__ribbon duet-css__ribbon--b"></span>
  <span class="duet-css__rail"></span>
</div>
```

```css
.kinetic-duet,
.duet-css {
  position: relative;
  isolation: isolate;
  overflow: clip;
  min-height: clamp(18rem, 48vw, 42rem);
  background:
    radial-gradient(ellipse at 50% 48%, rgb(52 61 88 / 0.32), transparent 52%),
    #080b12;
}

.duet-css__ribbon {
  position: absolute;
  left: 11%;
  top: 31%;
  width: 78%;
  height: 38%;
  box-sizing: border-box;
  border: clamp(0.35rem, 0.8vw, 0.7rem) solid transparent;
  border-top-color: var(--duet-colour);
  border-radius: 50%;
  filter: drop-shadow(0 0.7rem 1rem rgb(0 0 0 / 0.3));
  transform-origin: center;
}

.duet-css__ribbon--a {
  --duet-colour: #d86543;
  transform: rotate(8deg) skewX(-9deg);
}

.duet-css__ribbon--b {
  --duet-colour: #526cc7;
  transform: rotate(-8deg) scaleY(-1) skewX(-9deg);
}

.duet-css__rail {
  position: absolute;
  left: 18%;
  right: 18%;
  bottom: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #c7a66a 18% 82%, transparent);
  opacity: 0.42;
}

.kinetic-duet__poster,
.kinetic-duet__canvas {
  position: absolute !important;
  inset: 0;
  width: 100%;
  height: 100%;
}

.kinetic-duet__canvas {
  pointer-events: none;
}

.kinetic-duet__pause {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  z-index: 2;
}

@media (prefers-reduced-motion: reduce) {
  .kinetic-duet *,
  .duet-css * {
    animation: none !important;
    transition-duration: 0.001ms !important;
  }
}
```

The SVG is the preferred static visual because it preserves the woven trajectories and spans more accurately. The CSS-only form is the final no-SVG/no-JavaScript safety net.

## Accessibility

- Treat the 3D and fallback artwork as one decorative figure with one text alternative.
- Apply `aria-hidden="true"` to canvas and fallback, and expose the `figcaption`.
- Text alternative: “Two woven ribbons trace a coordinated partner dance: they counterbalance, exchange height, and recover together.”
- Add: “This decorative visual is not an instructional demonstration.”
- Keep organisation status, disciplines, calls to action, and all other meaning in normal HTML.
- Never encode discipline only by colour; an adjacent heading or selected HTML control names it.
- Pause/play and discipline controls must have visible focus, at least 44×44 CSS-pixel targets, and meaningful pressed/selected state.
- With reduced motion, render the static fallback, omit pointer response, and avoid loading the 3D bundle.
- The art remains legible under forced colours; the text content remains sufficient if all artwork disappears.

## Mobile and performance safeguards

- Full geometry: 128 segments per ribbon; low quality: 72.
- DPR cap: `1.5` desktop, `1.15` coarse-pointer/mobile.
- Disable antialiasing in low quality.
- Do not use MSAA render targets, bloom, SSAO, shadows, transmission, video, or texture sampling.
- Cap frame delta at `50ms`; never “catch up” missed animation.
- Target 60fps on a current mid-range laptop and 30fps or better on a mid-range Android device.
- Target fewer than 2,000 triangles, 9 draw calls, 6 live materials, and 16MB incremental GPU memory.
- Deferred 3D payload target: at most 250KB gzip including Three/R3F when they are not already shared; app-specific scene code at most 20KB gzip.
- Main-thread target while running: under 4ms median scripting per frame on the reference mid-range device.
- Zero continuous frames while offscreen, document-hidden, user-paused, or motion-reduced.
- No network request is required after the JavaScript chunk; no cursor telemetry is stored or transmitted.

These are release gates to measure on the actual production bundle and reference devices, not claims that the sketch automatically meets them.

## Test approach

### Unit

- Sample every path variant across a complete phase and assert finite coordinates.
- Assert the loop’s first and last temporal samples are continuous within a small epsilon.
- Assert ribbon separation remains greater than the configured surface thickness.
- Assert geometry index bounds, vertex counts, normal lengths, and fixed bounding sphere.
- Assert clamped delta cannot advance more than `1/20s`.

### Component

Use Vitest and React Testing Library with mocked media queries, `IntersectionObserver`, and lazy module:

- Server/static render exposes the figure description and fallback.
- The 3D import is not requested before the preload boundary.
- Reduced motion, `Save-Data`, unsupported WebGL2, and load failure never request or retain the canvas.
- Falling below the visibility threshold pauses; returning resumes the stored phase.
- `document.hidden` pauses and cleanup removes all listeners/observers.
- Pause state changes accessible button text and persists for the session.
- Context loss invokes `onFailure` once and restores the fallback.

### Browser and visual

Use Playwright at fixed animation phase:

- Screenshot fallback, WebGL desktop, narrow mobile, each discipline, high contrast, and reduced motion.
- Run with WebGL disabled and verify that content and controls remain complete.
- Check keyboard order, visible focus, zoom at 200%, and screen-reader announcement.
- Force a context loss through `WEBGL_lose_context` in a test page.
- Verify touch scrolling is never captured.

### Performance

- Record `renderer.info.render.calls`, triangles, and allocated geometries/materials in a non-production diagnostics mode.
- Confirm no frame callbacks execute for ten seconds while offscreen or hidden.
- Profile a 20-second phrase on one mid-range Android device and one integrated-GPU laptop.
- Check the built chunk sizes in CI and fail only against the measured budgets above.
- Use tolerant visual diffs; GPU rasterization varies. Test geometry and state transitions numerically rather than relying solely on pixels.

## Release checklist

- Proposed status is explicit in nearby HTML copy.
- No affiliation, authority, or safety claim is implied.
- Both partners retain equal width, brightness, and agency.
- WebGL is an enhancement; the fallback is complete and immediate.
- Reduced motion avoids downloading and running the 3D scene.
- Pause, intersection, tab visibility, and context loss all stop rendering.
- No copyrighted asset, font outline, model, texture, or recorded choreography is embedded.
- Real-device frame time, draw calls, DPR, and deferred bundle size meet budget.
