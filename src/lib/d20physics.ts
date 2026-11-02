import { Body, ConvexPolyhedron, Plane, Vec3, World } from 'cannon-es';
import { Quaternion, Vector3 } from 'three';
import { faceToward, type D20Face } from './d20geometry';

export interface Bounds {
  halfWidth: number;
  halfDepth: number;
}

/** A recorded throw: one position and rotation per physics step (60 per second). */
export interface Throw {
  positions: Float32Array;
  rotations: Float32Array;
  steps: number;
  landing: number;
  final: Quaternion;
}

const UP = new Vector3(0, 1, 0);

/** The die as a convex polyhedron: its 12 corners and 20 outward-wound triangles. */
export function convexShape(faces: D20Face[]): ConvexPolyhedron {
  const vertices: Vec3[] = [];
  const index = (v: Vector3) => {
    let i = vertices.findIndex((p) => (p.x - v.x) ** 2 + (p.y - v.y) ** 2 + (p.z - v.z) ** 2 < 1e-8);
    if (i === -1) i = vertices.push(new Vec3(v.x, v.y, v.z)) - 1;
    return i;
  };
  const triangles = faces.map((f) => {
    const winding = f.b.clone().sub(f.a).cross(f.c.clone().sub(f.a)).dot(f.normal) > 0;
    return winding ? [index(f.a), index(f.b), index(f.c)] : [index(f.a), index(f.c), index(f.b)];
  });
  return new ConvexPolyhedron({ vertices, faces: triangles });
}

/**
 * Throws the die in a real rigid-body simulation (cannon-es: gravity, bounces, friction; a floor,
 * four walls and a ceiling keep it in view) and records every step until it comes to rest. Throws
 * that end tilted against a wall are discarded and thrown again.
 */
export function simulateThrow(shape: ConvexPolyhedron, faces: D20Face[], bounds: Bounds, random: () => number = Math.random): Throw {
  for (let attempt = 0; ; attempt++) {
    const result = once(shape, faces, bounds, random);
    if (result.flat || attempt >= 8) return result.throw;
  }
}

function plane(world: World, x: number, y: number, z: number, rx: number, ry: number) {
  const body = new Body({ mass: 0, shape: new Plane() });
  body.position.set(x, y, z);
  body.quaternion.setFromEuler(rx, ry, 0);
  world.addBody(body);
}

function once(shape: ConvexPolyhedron, faces: D20Face[], { halfWidth: w, halfDepth: d }: Bounds, random: () => number) {
  const world = new World({ gravity: new Vec3(0, -28, 0), allowSleep: true });
  world.defaultContactMaterial.friction = 0.55;
  world.defaultContactMaterial.restitution = 0.38;
  plane(world, 0, 0, 0, -Math.PI / 2, 0); // floor, facing up
  plane(world, 0, 7.5, 0, Math.PI / 2, 0); // ceiling, facing down
  plane(world, -w, 0, 0, 0, Math.PI / 2); // left wall, facing right
  plane(world, w, 0, 0, 0, -Math.PI / 2); // right wall, facing left
  plane(world, 0, 0, -d, 0, 0); // back wall, facing the camera
  plane(world, 0, 0, d, 0, Math.PI); // front wall, facing away

  const side = random() < 0.5 ? -1 : 1;
  const spin = () => (random() * 2 - 1) * 16;
  const body = new Body({ mass: 1, shape, linearDamping: 0.15, angularDamping: 0.35, allowSleep: true, sleepSpeedLimit: 0.12, sleepTimeLimit: 0.35 });
  body.position.set(side * (w - 1.1), 3.2 + random(), (random() * 2 - 1) * (d - 1));
  body.quaternion.setFromAxisAngle(new Vec3(random(), random(), random()).unit(), random() * Math.PI * 2);
  body.velocity.set(-side * (5 + random() * 4), -2 - random() * 2, (random() * 2 - 1) * 3);
  body.angularVelocity.set(spin(), spin(), spin());
  world.addBody(body);

  const max = 60 * 9;
  const positions = new Float32Array(max * 3);
  const rotations = new Float32Array(max * 4);
  let steps = 0;
  while (steps < max) {
    world.step(1 / 60); // exactly one 1/60 s step per recorded frame
    const p = body.position;
    const r = body.quaternion;
    positions.set([p.x, p.y, p.z], steps * 3);
    rotations.set([r.x, r.y, r.z, r.w], steps * 4);
    steps++;
    if (body.sleepState === Body.SLEEPING) break;
  }
  const r = body.quaternion;
  const final = new Quaternion(r.x, r.y, r.z, r.w);
  const top = faceToward(faces, final, UP);
  return { flat: top.dot > 0.985, throw: { positions, rotations, steps, landing: top.index, final } };
}
