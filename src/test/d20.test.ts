import { Quaternion, Vector3 } from 'three';
import { fairD20, rollMessage } from '../lib/d20';
import { buildD20, canonicalLabels, faceToward, hullPoints, labelMatrices, labelsFor } from '../lib/d20geometry';
import { convexShape, simulateThrow } from '../lib/d20physics';

describe('fair d20', () => {
  it('only returns 1–20 and rejects the biased tail of the 32-bit range', () => {
    const limit = Math.floor(0x1_0000_0000 / 20) * 20;
    const values = [limit + 3, 0xffffffff, 41]; // two rejected draws, then 41 → 41 % 20 + 1 = 2
    let i = 0;
    expect(fairD20((a) => { a[0] = values[i++]; return a; })).toBe(2);
    expect(i).toBe(3);
  });

  it('is roughly uniform with the real random source', () => {
    const counts = new Array(21).fill(0);
    for (let k = 0; k < 40000; k++) counts[fairD20()]++;
    expect(counts[0]).toBe(0);
    for (let n = 1; n <= 20; n++) expect(counts[n]).toBeGreaterThan(1700); // expected 2000
  });
});

describe('messages', () => {
  it('uses the right lines', () => {
    expect(rollMessage(1).heading).toBe('You rolled a natural 1.');
    expect(rollMessage(20)).toMatchObject({ heading: 'You rolled a natural 20.', nat20: true });
    expect(rollMessage(14).heading).toBe('You rolled a 14.');
    expect(rollMessage(13).line).toMatch(/^Thirteen/);
  });
});

describe('d20 geometry', () => {
  const { faces } = buildD20(1);
  const canon = canonicalLabels(faces);

  it('has 20 faces numbered 1–20 once each, opposite faces adding up to 21', () => {
    expect(faces).toHaveLength(20);
    expect([...canon].sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    faces.forEach((f, i) => {
      const opposite = faces.findIndex((g) => g.normal.dot(f.normal) < -0.999);
      expect(canon[i] + canon[opposite]).toBe(21);
    });
    expect(hullPoints(faces).length).toBe(12 * 3);
  });

  it('can put any number on any face, keeping a real d20 layout', () => {
    for (let landing = 0; landing < 20; landing++) {
      for (let target = 1; target <= 20; target++) {
        const labels = labelsFor(faces, canon, target, landing);
        expect(labels[landing]).toBe(target);
        expect(new Set(labels).size).toBe(20);
        faces.forEach((f, i) => {
          const opposite = faces.findIndex((g) => g.normal.dot(f.normal) < -0.999);
          expect(labels[i] + labels[opposite]).toBe(21);
        });
      }
    }
  });

  it('turns the readable face so its number points at screen-up', () => {
    const q = new Quaternion().setFromAxisAngle(new Vector3(1, 2, 3).normalize(), 1.1);
    const top = faceToward(faces, q, new Vector3(0, 1, 0)).index;
    const m = labelMatrices(faces, top, q, new Vector3(0, 0, -1))[top];
    const up = new Vector3().setFromMatrixColumn(m, 1).applyQuaternion(q);
    const n = faces[top].normal.clone().applyQuaternion(q);
    const screenUp = new Vector3(0, 0, -1);
    const expected = screenUp.sub(n.clone().multiplyScalar(screenUp.dot(n))).normalize();
    expect(up.dot(expected)).toBeGreaterThan(0.999);
  });
});

describe('physics throw', () => {
  it('tumbles and comes to rest flat on a face, inside the box', () => {
    const { faces } = buildD20(0.9);
    const shape = convexShape(faces);
    for (let k = 0; k < 8; k++) {
      const t = simulateThrow(shape, faces, { halfWidth: 3, halfDepth: 1.8 });
      expect(t.steps).toBeGreaterThan(30);
      expect(faceToward(faces, t.final, new Vector3(0, 1, 0)).dot).toBeGreaterThan(0.985);
      const last = (t.steps - 1) * 3;
      expect(Math.abs(t.positions[last])).toBeLessThan(3);
      expect(Math.abs(t.positions[last + 2])).toBeLessThan(1.8);
      expect(t.positions[last + 1]).toBeLessThan(1.2); // resting on the floor
    }
  });
});
