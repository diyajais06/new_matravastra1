import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GOLD = "#d4af37";

function Water() {
  const mat = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((s) => (uniforms.uTime.value = s.clock.elapsedTime));
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -2.2, 0]}>
      <planeGeometry args={[80, 40, 160, 80]} />
      <shaderMaterial
        ref={mat}
        transparent
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime; varying float vH; varying vec2 vUv;
          void main(){ vUv=uv; vec3 p=position;
            float h=sin(p.x*0.6+uTime*0.6)*0.08+sin(p.y*0.9+uTime*0.8)*0.06+sin((p.x+p.y)*1.7+uTime)*0.03;
            p.z+=h; vH=h; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);} `}
        fragmentShader={`
          uniform float uTime; varying float vH; varying vec2 vUv;
          void main(){
            float streak = smoothstep(0.08,0.0,abs(vUv.x-0.5+sin(vUv.y*30.0+uTime)*0.01));
            float shimmer = pow(max(0.0, vH*8.0+0.5), 3.0);
            vec3 base = mix(vec3(0.02,0.02,0.03), vec3(0.06,0.04,0.03), vUv.y);
            vec3 gold = vec3(0.83,0.69,0.22);
            vec3 col = base + gold*(streak*0.35*vUv.y + shimmer*0.12);
            float fade = smoothstep(0.0,0.35,vUv.y);
            gl_FragColor = vec4(col, 0.95*fade);
          }`}
      />
    </mesh>
  );
}

function Ghats() {
  const blocks = useMemo(() => {
    const arr = [];
    let x = -22;
    while (x < 22) {
      const w = 1 + Math.random() * 2.4;
      const h = 1.2 + Math.random() * 3.2;
      arr.push({ x: x + w / 2, w, h, d: 1 + Math.random() });
      x += w + 0.05;
    }
    return arr;
  }, []);
  return (
    <group position={[0, -2.2, -14]}>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, 0]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color="#120e0c" roughness={0.9} emissive="#2a1a0a" emissiveIntensity={0.25} />
        </mesh>
      ))}
      {[0, 1, 2, 3, 4].map((s) => (
        <mesh key={`s${s}`} position={[0, 0.1 * s, 1.2 + s * 0.4]}>
          <boxGeometry args={[46, 0.12, 0.4]} />
          <meshStandardMaterial color="#1a1410" roughness={1} />
        </mesh>
      ))}
      {blocks.filter((_, i) => i % 3 === 0).map((b, i) => (
        <pointLight key={`l${i}`} position={[b.x, b.h * 0.6, 1.2]} color="#ffb347" intensity={1.2} distance={4} />
      ))}
    </group>
  );
}

function Temple() {
  const profile = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      pts.push(new THREE.Vector2(1.6 * Math.pow(1 - t, 1.4) * (1 + 0.06 * Math.sin(t * 40)), t * 6.5));
    }
    return pts;
  }, []);
  return (
    <group position={[2.5, 1.2, -15]}>
      <mesh>
        <latheGeometry args={[profile, 8]} />
        <meshStandardMaterial color="#1a130c" metalness={0.6} roughness={0.5} emissive="#4a3210" emissiveIntensity={0.35} />
      </mesh>
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, 0, 0.3]} scale={0.55}>
          <latheGeometry args={[profile, 8]} />
          <meshStandardMaterial color="#17110b" metalness={0.5} roughness={0.6} emissive="#3a270c" emissiveIntensity={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 6.9, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      <pointLight position={[0, 7, 1]} color={GOLD} intensity={4} distance={10} />
    </group>
  );
}

function Particles({ count }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 30;
      p[i * 3 + 1] = Math.random() * 12 - 2;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20 - 3;
    }
    return p;
  }, [count]);
  useFrame((_, d) => {
    const a = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      a[i * 3 + 1] += d * (0.15 + (i % 5) * 0.04);
      a[i * 3] += Math.sin(a[i * 3 + 1] + i) * d * 0.05;
      if (a[i * 3 + 1] > 10) a[i * 3 + 1] = -2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#f3e5ab" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function Silk({ color, position, rotation, speed = 1 }) {
  const ref = useRef();
  const base = useRef();
  useFrame((s) => {
    const g = ref.current.geometry;
    if (!base.current) base.current = g.attributes.position.array.slice();
    const a = g.attributes.position.array;
    const t = s.clock.elapsedTime * speed;
    for (let i = 0; i < a.length; i += 3) {
      const x = base.current[i];
      const y = base.current[i + 1];
      a[i + 2] = Math.sin(x * 0.9 + t) * 0.5 + Math.cos(y * 1.3 + t * 0.7) * 0.25;
    }
    g.attributes.position.needsUpdate = true;
    g.computeVertexNormals();
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <planeGeometry args={[16, 0.7, 60, 6]} />
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.28} side={THREE.DoubleSide} transparent opacity={0.32} emissive={color} emissiveIntensity={0.12} />
    </mesh>
  );
}

function FloatingTees() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.5, -0.7); s.lineTo(0.5, -0.7); s.lineTo(0.5, 0.25); s.lineTo(0.85, 0.05); s.lineTo(1, 0.4);
    s.lineTo(0.45, 0.75); s.quadraticCurveTo(0, 0.55, -0.45, 0.75); s.lineTo(-1, 0.4); s.lineTo(-0.85, 0.05);
    s.lineTo(-0.5, 0.25); s.closePath();
    return s;
  }, []);
  const group = useRef();
  useFrame((s) => {
    group.current.children.forEach((c, i) => {
      c.rotation.y = s.clock.elapsedTime * 0.25 + i;
      c.position.y = c.userData.y + Math.sin(s.clock.elapsedTime * 0.6 + i) * 0.3;
    });
  });
  const items = [[-7, 3.5, -6], [7.5, 4.5, -8], [-4, 6, -10], [5, 1.5, -5]];
  return (
    <group ref={group}>
      {items.map((p, i) => (
        <mesh key={i} position={p} userData={{ y: p[1] }} scale={0.7}>
          <extrudeGeometry args={[shape, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }]} />
          <meshStandardMaterial color={i % 2 ? "#58181a" : "#1a1612"} metalness={0.4} roughness={0.5} emissive={GOLD} emissiveIntensity={0.05} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Rig() {
  useFrame((s) => {
    const scroll = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    s.camera.position.x += (s.pointer.x * 1.2 - s.camera.position.x) * 0.03;
    s.camera.position.y += (1 + s.pointer.y * 0.5 - scroll * 1.5 - s.camera.position.y) * 0.03;
    s.camera.position.z += (8 - scroll * 3 - s.camera.position.z) * 0.03;
    s.camera.lookAt(0, 1 - scroll * 1.2, -8);
  });
  return null;
}

export const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
};

export default function KashiScene() {
  const low = (navigator.hardwareConcurrency || 4) <= 4 || window.innerWidth < 768;
  return (
    <Canvas
      dpr={low ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 1, 8], fov: 55 }}
      gl={{ antialias: !low, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#080708"]} />
      <fog attach="fog" args={["#080708", 10, 34]} />
      <ambientLight intensity={0.35} color="#ffe2a8" />
      <directionalLight position={[4, 8, 4]} intensity={0.9} color="#f3e5ab" />
      <pointLight position={[0, 4, -10]} intensity={6} distance={30} color="#ff9e3d" />
      <Temple />
      <Ghats />
      <Water />
      <Particles count={low ? 220 : 500} />
      <Silk color="#d4af37" position={[0, 4.5, -6]} rotation={[0.2, 0, -0.08]} speed={0.6} />
      <Silk color="#58181a" position={[1, 3.4, -7]} rotation={[0.25, 0.1, 0.06]} speed={0.45} />
      {!low && <FloatingTees />}
      <Rig />
    </Canvas>
  );
}
