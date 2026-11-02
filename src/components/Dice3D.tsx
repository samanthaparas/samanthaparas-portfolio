import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  type Group,
  type Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PMREMGenerator,
  PointsMaterial,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildD20, canonicalLabels, labelMatrices, labelsFor } from '../lib/d20geometry';
import { convexShape, simulateThrow, type Throw } from '../lib/d20physics';

/**
 * The 404's 3D d20 (lazy-loaded). Each roll is a real cannon-es throw recorded step by step and played
 * back; before playback the faces are renumbered with one of the d20's symmetries so the face that
 * physics leaves on top shows the fairly chosen `value`. Brand palette: plum, amethyst, rose gold.
 */
export interface Dice3DProps {
  value: number;
  rollKey: number;
  celebrate: boolean;
  lowPower: boolean;
  onSettled: () => void;
  onDieClick: () => void;
}

const RADIUS = 1;
// Wide view while it tumbles; after it settles the camera glides in over the result.
const CAMERA = new Vector3(0, 10, 3.8);
const CLOSE = new Vector3(0, 5.3, 1.9);
const SCREEN_UP = new Vector3(0, 0, -1); // on the floor, "up the screen" points away from the camera
const ROSE_GOLD = '#e8b08f';

export default function Dice3D(props: Dice3DProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, props.lowPower ? 1 : 1.5]}
      camera={{ position: CAMERA.toArray(), fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: props.lowPower ? 'low-power' : 'default' }}
      onCreated={({ camera }) => camera.lookAt(0, 0.3, 0)}
    >
      <Scene {...props} />
    </Canvas>
  );
}

function numberTexture(n: number): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255, 196, 160, 0.9)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#f6d3b8';
  ctx.font = `700 ${n >= 10 ? 58 : 66}px Georgia, "Times New Roman", serif`;
  ctx.fillText(String(n), size / 2, size / 2 + 6);
  // 6 and 9 get the classic underline so they can't be confused.
  if (n === 6 || n === 9) ctx.fillRect(size / 2 - 14, size / 2 + 32, 28, 4);
  // A small four-point star above every number: the celestial touch.
  ctx.shadowBlur = 6;
  ctx.beginPath();
  const cx = size / 2;
  const cy = 22;
  ctx.moveTo(cx, cy - 9);
  ctx.quadraticCurveTo(cx, cy, cx + 9, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + 9);
  ctx.quadraticCurveTo(cx, cy, cx - 9, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - 9);
  ctx.fill();
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function glowTexture(inner: string): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new CanvasTexture(canvas);
}

function Scene({ value, rollKey, celebrate, lowPower, onSettled, onDieClick }: Dice3DProps) {
  const { gl, scene, size, invalidate, camera } = useThree();
  const die = useRef<Group>(null);
  const shadow = useRef<Mesh>(null);
  const labelMeshes = useRef<(Mesh | null)[]>([]);
  const [hover, setHover] = useState(false);
  useEffect(() => () => {
    document.body.style.cursor = '';
  }, []);

  // Built once; everything created here is disposed below.
  const assets = useMemo(() => {
    const { geometry, faces } = buildD20(RADIUS);
    const edges: BufferGeometry[] = [];
    const seen = new Set<string>();
    for (const f of faces) {
      for (const [p, q] of [[f.a, f.b], [f.b, f.c], [f.c, f.a]] as const) {
        const key = [p, q].map((v) => v.toArray().map((x) => x.toFixed(3)).join(',')).sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        const length = p.distanceTo(q);
        const cylinder = new CylinderGeometry(0.02, 0.02, length, 6, 1);
        const dir = q.clone().sub(p).normalize();
        cylinder.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir));
        const mid = p.clone().add(q).multiplyScalar(0.5);
        cylinder.translate(mid.x, mid.y, mid.z);
        edges.push(cylinder);
      }
    }
    const edgeGeometry = mergeGeometries(edges)!;
    edges.forEach((e) => e.dispose());
    const resin = new MeshPhysicalMaterial({
      color: '#8a52c4',
      roughness: 0.08,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      ior: 1.5,
      thickness: 1.4,
      attenuationColor: '#3b1257',
      attenuationDistance: 1.2,
      emissive: '#3a0f5a',
      emissiveIntensity: 0.45,
      ...(lowPower ? { transparent: true, opacity: 0.88 } : { transmission: 0.82 }),
    });
    const edgeMaterial = new MeshStandardMaterial({ color: ROSE_GOLD, metalness: 1, roughness: 0.28, emissive: '#5a2a18', emissiveIntensity: 0.25 });
    const numbers = Array.from({ length: 21 }, (_, n) => (n === 0 ? null : numberTexture(n)));
    const labelGeometry = new PlaneGeometry(0.5, 0.5);
    const labelMaterials = faces.map(() => new MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false }));
    const shadowTexture = glowTexture('rgba(10, 0, 20, 0.55)');
    const shadowMaterial = new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
    const shadowGeometry = new PlaneGeometry(2.4, 2.4);

    // Starfield behind the die and a burst of gold for natural 20s.
    const starGeometry = new BufferGeometry();
    const stars = new Float32Array(160 * 3);
    for (let i = 0; i < 160; i++) stars.set([(Math.random() - 0.5) * 16, Math.random() * 1.5 - 1.2, -2 - Math.random() * 6], i * 3);
    starGeometry.setAttribute('position', new BufferAttribute(stars, 3));
    // Round, soft sprites so stars and sparkles glow instead of rendering as squares.
    const sparkTexture = glowTexture('rgba(255, 236, 200, 1)');
    const starMaterial = new PointsMaterial({ color: '#f1c6ff', map: sparkTexture, size: 0.09, transparent: true, opacity: 0.7, depthWrite: false, blending: AdditiveBlending });
    const burstGeometry = new BufferGeometry();
    burstGeometry.setAttribute('position', new BufferAttribute(new Float32Array(180 * 3), 3));
    const burstMaterial = new PointsMaterial({ color: '#ffcf7a', map: sparkTexture, size: 0.2, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending });

    return {
      geometry, faces, canonical: canonicalLabels(faces), shape: convexShape(faces), edgeGeometry, resin, edgeMaterial,
      numbers, labelGeometry, labelMaterials, shadowTexture, shadowMaterial, shadowGeometry, sparkTexture,
      starGeometry, starMaterial, burstGeometry, burstMaterial,
    };
  }, [lowPower]);

  // Studio reflections generated in code (no downloaded HDR), disposed with the scene.
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      env.dispose();
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useEffect(() => () => {
    const a = assets;
    [a.geometry, a.edgeGeometry, a.labelGeometry, a.shadowGeometry, a.starGeometry, a.burstGeometry].forEach((g) => g.dispose());
    [a.resin, a.edgeMaterial, a.shadowMaterial, a.starMaterial, a.burstMaterial, ...a.labelMaterials].forEach((m) => m.dispose());
    a.numbers.forEach((t) => t?.dispose());
    a.shadowTexture.dispose();
    a.sparkTexture.dispose();
  }, [assets]);

  // Each roll: simulate, renumber so `value` ends on top, then play the throw back.
  // `start` stays null through two warm-up frames (die held at its first pose while shaders compile),
  // so the throw's clock begins on a frame that actually reached the screen.
  const play = useRef<{ throw: Throw; start: number | null; last: number; warm: number; settled: boolean } | null>(null);
  const glide = useRef<{ start: number; from: Vector3; to: Vector3; look: Vector3 } | null>(null);
  const burst = useRef<{ start: number; velocities: Float32Array } | null>(null);
  const aspect = size.width / Math.max(size.height, 1);
  useEffect(() => {
    {
      const bounds = { halfWidth: Math.min(4.2, Math.max(1.6, 2.4 * aspect - 0.3)), halfDepth: 1.9 };
      const t = simulateThrow(assets.shape, assets.faces, bounds);
      const labels = labelsFor(assets.faces, assets.canonical, value, t.landing);
      const matrices = labelMatrices(assets.faces, t.landing, t.final, SCREEN_UP);
      labelMeshes.current.forEach((mesh, i) => {
        if (!mesh) return;
        assets.labelMaterials[i].map = assets.numbers[labels[i]];
        assets.labelMaterials[i].needsUpdate = true;
        mesh.matrix.copy(matrices[i]);
        mesh.matrixWorldNeedsUpdate = true;
      });
      burst.current = null;
      assets.burstMaterial.opacity = 0;
      play.current = { throw: t, start: null, last: 0, warm: 2, settled: false };
      glide.current = null;
      camera.position.copy(CAMERA);
      camera.lookAt(0, 0.3, 0);
      gl.compile(scene, camera); // compile every material now, not mid-throw
      invalidate();
    }
    // Only a new roll restarts the throw; resizing mid-roll doesn't.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollKey, assets]);

  // Natural 20: a gentle fountain of gold from the die.
  useEffect(() => {
    if (!celebrate || !die.current) return;
    const origin = die.current.position;
    const positions = assets.burstGeometry.getAttribute('position') as BufferAttribute;
    const velocities = new Float32Array(positions.count * 3);
    for (let i = 0; i < positions.count; i++) {
      positions.setXYZ(i, origin.x, origin.y + 0.4, origin.z);
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.2;
      velocities.set([Math.cos(angle) * speed, 2.5 + Math.random() * 3, Math.sin(angle) * speed], i * 3);
    }
    positions.needsUpdate = true;
    burst.current = { start: performance.now(), velocities };
    invalidate();
  }, [celebrate, assets, invalidate]);

  const q = useMemo(() => [new Quaternion(), new Quaternion()], []);
  useFrame((_, delta) => {
    const p = play.current;
    let busy = false;
    if (p && die.current) {
      const t = p.throw;
      const now = performance.now();
      if (p.start === null) {
        if (p.warm > 0) p.warm -= 1;
        else p.start = now;
      } else if (now - p.last > 50) {
        // A long frame (tab switch, busy device): pause the throw instead of jumping ahead.
        p.start += now - p.last - 1000 / 60;
      }
      p.last = now;
      const exact = p.start === null ? 0 : ((now - p.start) / 1000) * 60;
      const i = Math.min(Math.floor(exact), t.steps - 1);
      const j = Math.min(i + 1, t.steps - 1);
      const f = Math.min(exact - i, 1);
      die.current.position.set(
        t.positions[i * 3] + (t.positions[j * 3] - t.positions[i * 3]) * f,
        t.positions[i * 3 + 1] + (t.positions[j * 3 + 1] - t.positions[i * 3 + 1]) * f,
        t.positions[i * 3 + 2] + (t.positions[j * 3 + 2] - t.positions[i * 3 + 2]) * f,
      );
      q[0].fromArray(t.rotations, i * 4);
      q[1].fromArray(t.rotations, j * 4);
      die.current.quaternion.slerpQuaternions(q[0], q[1], f);
      if (shadow.current) {
        shadow.current.position.set(die.current.position.x, 0.002, die.current.position.z);
        const lift = Math.max(0, die.current.position.y - RADIUS * 0.8);
        shadow.current.scale.setScalar(1 + lift * 0.25);
        (shadow.current.material as MeshBasicMaterial).opacity = Math.max(0.25, 1 - lift * 0.3);
      }
      if (i >= t.steps - 1) {
        if (!p.settled) {
          p.settled = true;
          const at = die.current.position;
          glide.current = {
            start: performance.now(),
            from: camera.position.clone(),
            to: new Vector3(at.x * 0.85, CLOSE.y, at.z + CLOSE.z),
            look: new Vector3(at.x, at.y * 0.6, at.z),
          };
          onSettled();
        }
      } else {
        busy = true;
      }
      if (p.start === null) busy = true;
    }
    const g = glide.current;
    if (g) {
      const k = Math.min((performance.now() - g.start) / 900, 1);
      const ease = 1 - (1 - k) ** 3;
      camera.position.lerpVectors(g.from, g.to, ease);
      const look = new Vector3(0, 0.3, 0).lerp(g.look, ease);
      camera.lookAt(look);
      if (k < 1) busy = true;
    }
    const b = burst.current;
    if (b) {
      const age = (performance.now() - b.start) / 1000;
      const positions = assets.burstGeometry.getAttribute('position') as BufferAttribute;
      for (let k = 0; k < positions.count; k++) {
        positions.setXYZ(
          k,
          positions.getX(k) + b.velocities[k * 3] * delta,
          positions.getY(k) + b.velocities[k * 3 + 1] * delta,
          positions.getZ(k) + b.velocities[k * 3 + 2] * delta,
        );
        b.velocities[k * 3 + 1] -= 4.5 * delta;
      }
      positions.needsUpdate = true;
      assets.burstMaterial.opacity = Math.max(0, 1 - age / 2.2);
      if (age < 2.2) busy = true;
      else burst.current = null;
    }
    assets.starMaterial.opacity = 0.55 + Math.sin(performance.now() / 900) * 0.15;
    if (busy) invalidate();
  });

  return (
    <>
      <ambientLight intensity={0.25} color="#b48ad8" />
      <directionalLight position={[3, 8, 4]} intensity={1.6} color="#ffe2cf" />
      <directionalLight position={[-5, 3, -4]} intensity={1.1} color="#a66bff" />
      <points geometry={assets.starGeometry} material={assets.starMaterial} />
      <mesh ref={shadow} geometry={assets.shadowGeometry} material={assets.shadowMaterial} rotation={[-Math.PI / 2, 0, 0]} />
      <group
        ref={die}
        position={[0, RADIUS, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onDieClick();
        }}
        onPointerOver={() => {
          setHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = '';
        }}
      >
        <mesh geometry={assets.geometry} material={assets.resin} />
        <mesh geometry={assets.edgeGeometry} material={assets.edgeMaterial} />
        {assets.faces.map((_, i) => (
          <mesh
            key={i}
            ref={(m) => {
              labelMeshes.current[i] = m;
            }}
            geometry={assets.labelGeometry}
            material={assets.labelMaterials[i]}
            matrixAutoUpdate={false}
          />
        ))}
        <pointLight color="#c77dff" intensity={hover ? 3.2 : 2.2} distance={3} decay={2} />
      </group>
      <points geometry={assets.burstGeometry} material={assets.burstMaterial} />
    </>
  );
}

