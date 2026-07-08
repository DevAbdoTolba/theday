// src/components/grad/expressiveShapes.ts
// Material 3 Expressive-style container shapes (scallops, bursts, flowers,
// squircles) generated as SVG paths with a FIXED sample count, so any two
// shapes share the same path structure and framer-motion can morph the `d`
// attribute between them fluidly.

export interface ShapeSpec {
  /** number of lobes/points around the ring (0 = circle) */
  lobes: number;
  /** wave amplitude, 0..0.35 — how far lobes push in/out */
  amp: number;
  /**
   * lobe sharpness: 1 = soft sine scallop, >1 = pointier star,
   * <1 = puffier flower petals
   */
  pointy?: number;
  /** superellipse exponent — squares the base ring (4 ≈ squircle) */
  square?: number;
  /** phase offset in radians so shapes don't all align */
  phase?: number;
}

const SAMPLES = 144;

/** Unit-radius shape path inside viewBox "-1.15 -1.15 2.3 2.3". */
export function shapePath(spec: ShapeSpec): string {
  const { lobes, amp, pointy = 1, square = 2, phase = 0 } = spec;
  const pts: string[] = [];

  for (let i = 0; i < SAMPLES; i++) {
    const t = (i / SAMPLES) * Math.PI * 2;

    // superellipse base radius (square=2 → circle, higher → squircle)
    const c = Math.cos(t);
    const s = Math.sin(t);
    const base =
      1 / Math.pow(Math.pow(Math.abs(c), square) + Math.pow(Math.abs(s), square), 1 / square);

    // lobe modulation
    let wave = 0;
    if (lobes > 0 && amp > 0) {
      const w = Math.cos(lobes * t + phase);
      wave = Math.sign(w) * Math.pow(Math.abs(w), pointy);
    }

    const r = base * (1 - amp) + amp * base * wave;
    pts.push(`${(r * c).toFixed(4)} ${(r * s).toFixed(4)}`);
  }

  return `M ${pts.join(" L ")} Z`;
}

// --- Preset shape library ----------------------------------------------------
// A tiny slice of the "35 shapes" family: enough distinct silhouettes for the
// wing's identity while staying morph-compatible with each other.

export const SHAPES = {
  circle: shapePath({ lobes: 0, amp: 0 }),
  /** 12-tooth soft scallop — the "sunny" cookie */
  scallop: shapePath({ lobes: 12, amp: 0.075, pointy: 1 }),
  /** 8-point rounded starburst */
  burst: shapePath({ lobes: 8, amp: 0.16, pointy: 1.6 }),
  /** 6-petal organic flower */
  flower: shapePath({ lobes: 6, amp: 0.11, pointy: 0.7, phase: Math.PI / 6 }),
  /** soft 4-lobed clover */
  clover: shapePath({ lobes: 4, amp: 0.14, pointy: 0.8, phase: Math.PI / 4 }),
  /** squircle container */
  squircle: shapePath({ lobes: 0, amp: 0, square: 3.4 }),
  /** wobbly organic blob */
  blob: shapePath({ lobes: 3, amp: 0.08, pointy: 0.9, phase: 1.1 }),
} as const;

export type ShapeName = keyof typeof SHAPES;

export const SHAPE_VIEWBOX = "-1.15 -1.15 2.3 2.3";
