import { IcosahedronGeometry, Matrix4, Quaternion, Vector3 } from 'three';

/**
 * A d20 is a regular icosahedron: 20 triangular faces, 12 vertices, 30 edges. This module numbers the
 * faces like a real die (opposite faces add up to 21) and renumbers them with one of the solid's 60
 * rotational symmetries so a chosen number lands on whichever face the physics left on top.
 */
export interface D20Face {
  a: Vector3;
  b: Vector3;
  c: Vector3;
  centroid: Vector3;
  normal: Vector3;
}

export function buildD20(radius: number) {
  const geometry = new IcosahedronGeometry(radius, 0); // non-indexed: 20 faces × 3 vertices
  const pos = geometry.getAttribute('position');
  const faces: D20Face[] = [];
  for (let i = 0; i < 20; i++) {
    const a = new Vector3().fromBufferAttribute(pos, i * 3);
    const b = new Vector3().fromBufferAttribute(pos, i * 3 + 1);
    const c = new Vector3().fromBufferAttribute(pos, i * 3 + 2);
    const centroid = a.clone().add(b).add(c).divideScalar(3);
    const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
    if (normal.dot(centroid) < 0) normal.negate(); // always outward
    faces.push({ a, b, c, centroid, normal });
  }
  geometry.computeVertexNormals(); // non-indexed, so each face stays flat
  return { geometry, faces };
}

/** Unique vertices, for the physics convex hull. */
export function hullPoints(faces: D20Face[]): Float32Array {
  const seen: Vector3[] = [];
  for (const f of faces) for (const v of [f.a, f.b, f.c]) if (!seen.some((s) => s.distanceToSquared(v) < 1e-8)) seen.push(v);
  return new Float32Array(seen.flatMap((v) => [v.x, v.y, v.z]));
}

/** Canonical numbering: faces in pairs, each pair opposite, adding up to 21. */
export function canonicalLabels(faces: D20Face[]): number[] {
  const labels = new Array<number>(20).fill(0);
  let next = 1;
  faces.forEach((f, i) => {
    if (labels[i]) return;
    let opposite = -1;
    let best = Infinity;
    faces.forEach((g, j) => {
      const d = f.normal.dot(g.normal);
      if (j !== i && d < best) {
        best = d;
        opposite = j;
      }
    });
    labels[i] = next;
    labels[opposite] = 21 - next;
    next += 1;
  });
  return labels;
}

function frame(f: D20Face, first: Vector3): Matrix4 {
  const x = first.clone().sub(f.centroid).normalize();
  const z = f.normal.clone();
  const y = z.clone().cross(x).normalize();
  return new Matrix4().makeBasis(x, y, z);
}

/**
 * Renumber the die so `target` sits on face `landing`, by rotating the canonical numbering with an
 * icosahedral symmetry (it maps the face carrying `target` onto `landing`, and every face onto a face).
 */
export function labelsFor(faces: D20Face[], canonical: number[], target: number, landing: number): number[] {
  const from = faces[canonical.indexOf(target)];
  const to = faces[landing];
  const rotation = frame(to, to.a).multiply(frame(from, from.a).transpose());
  const labels = new Array<number>(20).fill(0);
  faces.forEach((f, i) => {
    const moved = f.centroid.clone().applyMatrix4(rotation);
    let j = 0;
    let best = Infinity;
    faces.forEach((g, k) => {
      const d = g.centroid.distanceToSquared(moved);
      if (d < best) {
        best = d;
        j = k;
      }
    });
    labels[j] = canonical[i];
  });
  return labels;
}

/** The face pointing most nearly along `dir` (world space) for a die rotated by `q`. */
export function faceToward(faces: D20Face[], q: Quaternion, dir: Vector3): { index: number; dot: number } {
  let index = 0;
  let dot = -Infinity;
  faces.forEach((f, i) => {
    const d = f.normal.clone().applyQuaternion(q).dot(dir);
    if (d > dot) {
      dot = d;
      index = i;
    }
  });
  return { index, dot };
}

/**
 * Where to put each face's number: a small square just above the face, facing out. The number's "up"
 * points at the face's first corner, except on `readable`, where it points at screen-up for the final
 * orientation `q` so the result reads straight on.
 */
export function labelMatrices(faces: D20Face[], readable: number, q: Quaternion, screenUp: Vector3): Matrix4[] {
  const inverse = q.clone().invert();
  return faces.map((f, i) => {
    const n = f.normal;
    const up = i === readable ? screenUp.clone().applyQuaternion(inverse) : f.a.clone().sub(f.centroid);
    up.sub(n.clone().multiplyScalar(up.dot(n))).normalize();
    const right = up.clone().cross(n).normalize();
    const m = new Matrix4().makeBasis(right, up, n);
    m.setPosition(f.centroid.clone().add(n.clone().multiplyScalar(0.004)));
    return m;
  });
}
