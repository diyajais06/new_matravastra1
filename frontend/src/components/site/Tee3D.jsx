import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

function teeShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.62, -0.95); s.lineTo(0.62, -0.95); s.lineTo(0.62, 0.3); s.lineTo(1.05, 0.08); s.lineTo(1.25, 0.52);
  s.lineTo(0.55, 0.95); s.quadraticCurveTo(0, 0.7, -0.55, 0.95); s.lineTo(-1.25, 0.52); s.lineTo(-1.05, 0.08);
  s.lineTo(-0.62, 0.3); s.closePath();
  return s;
}

function printGeometry(shape, mirror) {
  const g = new THREE.ShapeGeometry(shape, 24);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const u = 0.08 + ((pos.getX(i) + 1.25) / 2.5) * 0.84;
    uv[i * 2] = mirror ? 1 - u : u;
    uv[i * 2 + 1] = 0.1 + ((pos.getY(i) + 0.95) / 1.9) * 0.8;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

function Shirt({ front, back, color, auto, flip }) {
  const ref = useRef();
  const [tf, tb] = useTexture([front, back]);
  [tf, tb].forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));
  const shape = useMemo(teeShape, []);
  const [gf, gb] = useMemo(() => [printGeometry(shape, false), printGeometry(shape, false)], [shape]);
  useFrame((_, d) => {
    if (!ref.current) return;
    if (auto) ref.current.rotation.y += d * 0.45;
    else ref.current.rotation.y += ((flip ? Math.PI : 0) - ref.current.rotation.y) * 0.08;
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0, -0.06]}>
        <extrudeGeometry args={[shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 4 }]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.105]} geometry={gf}>
        <meshStandardMaterial map={tf} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, -0.105]} rotation-y={Math.PI} geometry={gb}>
        <meshStandardMaterial map={tb} roughness={0.85} />
      </mesh>
    </group>
  );
}

export const Tee3D = ({ front, back, color = "#111111", auto = true, flip = false, className = "", testId = "tee-3d" }) => (
  <div className={className} data-testid={testId}>
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 3.4], fov: 40 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 3, 4]} intensity={1.6} color="#fff3d6" />
      <directionalLight position={[-3, -1, -3]} intensity={0.8} color="#d4af37" />
      <Suspense fallback={null}>
        <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.6}>
          <Shirt front={front} back={back} color={color} auto={auto} flip={flip} />
        </Float>
        <Environment preset="city" />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
    </Canvas>
  </div>
);
