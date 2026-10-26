import { describe, expect, it, vi } from "vitest";

import {
  advanceKineticPhase,
  createKineticRibbonBuffers,
  evaluateKineticCentre,
  KINETIC_POSITION_BOUND,
  KINETIC_RIBBON_WIDTH,
  writeKineticRibbonFrame,
} from "@/components/three/kinetic-duet-geometry";
import {
  hasUsableWebGL2,
  isKineticDuetLoadEligible,
} from "@/components/three/kinetic-duet-policy";
import type { KineticDiscipline } from "@/types/kinetic-duet";

const DISCIPLINES = [
  "boogie",
  "rock-n-roll",
  "acro",
] as const satisfies readonly KineticDiscipline[];

describe("Saath Rekha adaptive geometry", () => {
  it("keeps every discipline finite, bounded, periodic, and separated", () => {
    let allCoordinatesFinite = true;
    let maximumCoordinate = 0;
    let minimumSeparation = Number.POSITIVE_INFINITY;

    for (const discipline of DISCIPLINES) {
      for (let phaseIndex = 0; phaseIndex <= 32; phaseIndex += 1) {
        const phase = phaseIndex / 32;

        for (let pathIndex = 0; pathIndex <= 128; pathIndex += 1) {
          const t = pathIndex / 128;
          const partnerA = { x: 0, y: 0, z: 0 };
          const partnerB = { x: 0, y: 0, z: 0 };

          evaluateKineticCentre(partnerA, t, phase, -1, discipline);
          evaluateKineticCentre(partnerB, t, phase, 1, discipline);

          for (const coordinate of [
            partnerA.x,
            partnerA.y,
            partnerA.z,
            partnerB.x,
            partnerB.y,
            partnerB.z,
          ]) {
            allCoordinatesFinite =
              allCoordinatesFinite && Number.isFinite(coordinate);
            maximumCoordinate = Math.max(
              maximumCoordinate,
              Math.abs(coordinate),
            );
          }

          minimumSeparation = Math.min(
            minimumSeparation,
            Math.hypot(
              partnerA.x - partnerB.x,
              partnerA.y - partnerB.y,
              partnerA.z - partnerB.z,
            ),
          );
        }
      }

      const loopStart = { x: 0, y: 0, z: 0 };
      const loopEnd = { x: 0, y: 0, z: 0 };
      evaluateKineticCentre(loopStart, 0.43, 0, -1, discipline);
      evaluateKineticCentre(loopEnd, 0.43, 1, -1, discipline);
      expect(loopEnd.x).toBeCloseTo(loopStart.x, 6);
      expect(loopEnd.y).toBeCloseTo(loopStart.y, 6);
      expect(loopEnd.z).toBeCloseTo(loopStart.z, 6);
    }

    expect(allCoordinatesFinite).toBe(true);
    expect(maximumCoordinate).toBeLessThanOrEqual(KINETIC_POSITION_BOUND);
    expect(minimumSeparation).toBeGreaterThan(KINETIC_RIBBON_WIDTH);
  });

  it("writes valid indexed strips with unit normals", () => {
    const buffers = createKineticRibbonBuffers(128);
    const vertexCount = 258;

    expect(buffers.positions).toHaveLength(vertexCount * 3);
    expect(buffers.normals).toHaveLength(vertexCount * 3);
    expect(buffers.indices).toHaveLength(128 * 6);
    expect(Math.max(...buffers.indices)).toBeLessThan(vertexCount);

    for (const discipline of DISCIPLINES) {
      writeKineticRibbonFrame(buffers, 0.37, -1, discipline);

      expect([...buffers.positions].every(Number.isFinite)).toBe(true);
      expect(
        [...buffers.positions].every(
          (coordinate) => Math.abs(coordinate) <= KINETIC_POSITION_BOUND,
        ),
      ).toBe(true);

      for (let offset = 0; offset < buffers.normals.length; offset += 3) {
        expect(
          Math.hypot(
            buffers.normals[offset] ?? 0,
            buffers.normals[offset + 1] ?? 0,
            buffers.normals[offset + 2] ?? 0,
          ),
        ).toBeCloseTo(1, 5);
      }
    }

    expect(advanceKineticPhase(0, Number.POSITIVE_INFINITY, "boogie")).toBe(0);
    expect(advanceKineticPhase(0, 10, "boogie")).toBeLessThanOrEqual(
      1 / 20 / 5.6,
    );
  });
});

describe("Saath Rekha adaptive load policy", () => {
  const eligibleState = {
    failed: false,
    nearViewport: true,
    reducedMotion: false,
    saveData: false,
    webGL2: true,
  } as const;

  it("loads only after all adaptive safeguards pass", () => {
    expect(isKineticDuetLoadEligible(eligibleState)).toBe(true);
    expect(
      isKineticDuetLoadEligible({
        ...eligibleState,
        nearViewport: false,
      }),
    ).toBe(false);
    expect(
      isKineticDuetLoadEligible({
        ...eligibleState,
        reducedMotion: true,
      }),
    ).toBe(false);
    expect(
      isKineticDuetLoadEligible({
        ...eligibleState,
        saveData: true,
      }),
    ).toBe(false);
    expect(
      isKineticDuetLoadEligible({
        ...eligibleState,
        webGL2: false,
      }),
    ).toBe(false);
    expect(isKineticDuetLoadEligible({ ...eligibleState, failed: true })).toBe(
      false,
    );
  });

  it("fails the WebGL2 probe closed and releases a probe context", () => {
    expect(
      hasUsableWebGL2(
        () =>
          ({
            getContext: () => null,
          }) as unknown as HTMLCanvasElement,
      ),
    ).toBe(false);
    expect(
      hasUsableWebGL2(() => {
        throw new Error("Canvas unavailable");
      }),
    ).toBe(false);

    const loseContext = vi.fn();
    expect(
      hasUsableWebGL2(
        () =>
          ({
            getContext: () => ({
              getExtension: () => ({ loseContext }),
            }),
          }) as unknown as HTMLCanvasElement,
      ),
    ).toBe(true);
    expect(loseContext).toHaveBeenCalledOnce();
  });
});
