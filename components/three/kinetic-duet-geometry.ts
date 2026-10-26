import type { KineticDiscipline } from "@/types/kinetic-duet";

export type KineticPartner = -1 | 1;

export type MutableKineticPoint = {
  x: number;
  y: number;
  z: number;
};

type KineticPreset = {
  readonly depth: number;
  readonly duration: number;
  readonly harmonic: number;
  readonly separation: number;
  readonly vertical: number;
};

export type KineticRibbonBuffers = {
  readonly indices: Uint16Array;
  readonly normals: Float32Array;
  readonly positions: Float32Array;
  readonly segments: number;
};

export type KineticRibbonScratch = {
  readonly after: MutableKineticPoint;
  readonly before: MutableKineticPoint;
  readonly centre: MutableKineticPoint;
};

export const KINETIC_RIBBON_WIDTH = 0.12;
export const KINETIC_POSITION_BOUND = 8;
export const KINETIC_SPAN_SAMPLES = [
  0.16, 0.29, 0.42, 0.58, 0.71, 0.84,
] as const;

export const KINETIC_DISCIPLINE_PRESETS = {
  boogie: {
    duration: 5.6,
    vertical: 0.34,
    depth: 0.42,
    separation: 0.31,
    harmonic: 3,
  },
  "rock-n-roll": {
    duration: 4.9,
    vertical: 0.6,
    depth: 0.5,
    separation: 0.38,
    harmonic: 2,
  },
  acro: {
    duration: 6.8,
    vertical: 0.92,
    depth: 0.56,
    separation: 0.42,
    harmonic: 1,
  },
} as const satisfies Record<KineticDiscipline, KineticPreset>;

const TAU = Math.PI * 2;
const MIN_SEGMENTS = 8;
const MAX_SEGMENTS = 256;

function emptyPoint(): MutableKineticPoint {
  return { x: 0, y: 0, z: 0 };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function finiteOr(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function bounded(value: number, bound = KINETIC_POSITION_BOUND) {
  return clamp(finiteOr(value), -bound, bound);
}

function wrappedUnit(value: number) {
  const finite = finiteOr(value);
  return ((finite % 1) + 1) % 1;
}

function assertSegments(segments: number) {
  if (
    !Number.isInteger(segments) ||
    segments < MIN_SEGMENTS ||
    segments > MAX_SEGMENTS
  ) {
    throw new RangeError(
      `Kinetic ribbon segments must be an integer from ${MIN_SEGMENTS} to ${MAX_SEGMENTS}.`,
    );
  }
}

export function createKineticRibbonScratch(): KineticRibbonScratch {
  return {
    after: emptyPoint(),
    before: emptyPoint(),
    centre: emptyPoint(),
  };
}

export function evaluateKineticCentre(
  out: MutableKineticPoint,
  tValue: number,
  phaseValue: number,
  partner: KineticPartner,
  discipline: KineticDiscipline,
) {
  const t = clamp(finiteOr(tValue), 0, 1);
  const phase = wrappedUnit(phaseValue);
  const preset = KINETIC_DISCIPLINE_PRESETS[discipline];
  const envelope = Math.sin(Math.PI * t);
  const angle = TAU * (t + phase);
  const orbit = preset.separation * (0.22 + 0.78 * envelope);
  const sharedY =
    preset.vertical *
    envelope *
    (0.72 * Math.sin(angle) + 0.12 * Math.sin(preset.harmonic * angle));
  const sharedZ = preset.depth * envelope * 0.34 * Math.sin(2 * angle);
  const lift =
    discipline === "acro" ? partner * 0.24 * envelope * Math.sin(angle) : 0;

  out.x = bounded((t - 0.5) * 6.8);
  out.y = bounded(sharedY + lift + partner * orbit * Math.cos(angle + 0.38));
  out.z = bounded(sharedZ + partner * orbit * Math.sin(angle + 0.38));

  return out;
}

export function createKineticRibbonBuffers(
  segments: number,
): KineticRibbonBuffers {
  assertSegments(segments);

  const vertexCount = (segments + 1) * 2;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const indices = new Uint16Array(segments * 6);

  for (let segment = 0; segment < segments; segment += 1) {
    const vertex = segment * 2;
    indices.set(
      [vertex, vertex + 2, vertex + 1, vertex + 2, vertex + 3, vertex + 1],
      segment * 6,
    );
  }

  return { indices, normals, positions, segments };
}

export function writeKineticRibbonFrame(
  buffers: KineticRibbonBuffers,
  phase: number,
  partner: KineticPartner,
  discipline: KineticDiscipline,
  scratch: KineticRibbonScratch = createKineticRibbonScratch(),
) {
  const { normals, positions, segments } = buffers;
  const expectedLength = (segments + 1) * 6;

  if (
    positions.length !== expectedLength ||
    normals.length !== expectedLength
  ) {
    throw new RangeError("Kinetic ribbon buffers have an invalid length.");
  }

  const epsilon = 1 / segments;
  const halfWidth = KINETIC_RIBBON_WIDTH / 2;

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    evaluateKineticCentre(scratch.centre, t, phase, partner, discipline);
    evaluateKineticCentre(
      scratch.before,
      Math.max(0, t - epsilon),
      phase,
      partner,
      discipline,
    );
    evaluateKineticCentre(
      scratch.after,
      Math.min(1, t + epsilon),
      phase,
      partner,
      discipline,
    );

    let tangentX = scratch.after.x - scratch.before.x;
    let tangentY = scratch.after.y - scratch.before.y;
    let tangentZ = scratch.after.z - scratch.before.z;
    const tangentLength = Math.hypot(tangentX, tangentY, tangentZ) || 1;
    tangentX /= tangentLength;
    tangentY /= tangentLength;
    tangentZ /= tangentLength;

    let sideX = tangentY;
    let sideY = -tangentX;
    let sideZ = 0;
    const sideLength = Math.hypot(sideX, sideY) || 1;
    sideX /= sideLength;
    sideY /= sideLength;

    const twist = 0.18 * Math.sin(TAU * (t + wrappedUnit(phase)));
    const cosine = Math.cos(twist);
    const sine = Math.sin(twist);
    const crossX = tangentY * sideZ - tangentZ * sideY;
    const crossY = tangentZ * sideX - tangentX * sideZ;
    const crossZ = tangentX * sideY - tangentY * sideX;

    sideX = sideX * cosine + crossX * sine;
    sideY = sideY * cosine + crossY * sine;
    sideZ = sideZ * cosine + crossZ * sine;

    let normalX = sideY * tangentZ - sideZ * tangentY;
    let normalY = sideZ * tangentX - sideX * tangentZ;
    let normalZ = sideX * tangentY - sideY * tangentX;
    const normalLength = Math.hypot(normalX, normalY, normalZ) || 1;
    normalX /= normalLength;
    normalY /= normalLength;
    normalZ /= normalLength;

    for (let side = 0; side < 2; side += 1) {
      const sign = side === 0 ? -1 : 1;
      const offset = index * 6 + side * 3;
      positions[offset] = bounded(scratch.centre.x + sideX * halfWidth * sign);
      positions[offset + 1] = bounded(
        scratch.centre.y + sideY * halfWidth * sign,
      );
      positions[offset + 2] = bounded(
        scratch.centre.z + sideZ * halfWidth * sign,
      );
      normals[offset] = bounded(normalX, 1);
      normals[offset + 1] = bounded(normalY, 1);
      normals[offset + 2] = bounded(normalZ, 1);
    }
  }
}

export function createKineticSpanPositions() {
  return new Float32Array(KINETIC_SPAN_SAMPLES.length * 2 * 3);
}

export function writeKineticSpanFrame(
  positions: Float32Array,
  phase: number,
  discipline: KineticDiscipline,
) {
  if (positions.length !== KINETIC_SPAN_SAMPLES.length * 6) {
    throw new RangeError("Kinetic span buffer has an invalid length.");
  }

  const partnerA = emptyPoint();
  const partnerB = emptyPoint();

  KINETIC_SPAN_SAMPLES.forEach((t, index) => {
    evaluateKineticCentre(partnerA, t, phase, -1, discipline);
    evaluateKineticCentre(partnerB, t, phase, 1, discipline);
    const offset = index * 6;
    positions.set(
      [partnerA.x, partnerA.y, partnerA.z, partnerB.x, partnerB.y, partnerB.z],
      offset,
    );
  });
}

export function createKineticPhraseRailPositions() {
  const positions = new Float32Array((1 + KINETIC_SPAN_SAMPLES.length) * 6);
  const start = -2.9;
  const end = 2.9;
  const y = -1.35;
  const z = -0.24;

  positions.set([start, y, z, end, y, z], 0);

  KINETIC_SPAN_SAMPLES.forEach((t, index) => {
    const x = start + (end - start) * t;
    positions.set([x, y - 0.07, z, x, y + 0.07, z], (index + 1) * 6);
  });

  return positions;
}

export function clampKineticFrameDelta(delta: number) {
  return clamp(finiteOr(delta), 0, 1 / 20);
}

export function advanceKineticPhase(
  phase: number,
  delta: number,
  discipline: KineticDiscipline,
) {
  return wrappedUnit(
    wrappedUnit(phase) +
      clampKineticFrameDelta(delta) /
        KINETIC_DISCIPLINE_PRESETS[discipline].duration,
  );
}
