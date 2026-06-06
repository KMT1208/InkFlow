"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { MathUtils, type Group, type Mesh } from "three";

// Scène « encre » : sphère lisse fortement distordue (vertex shader) pour un
// rendu liquide, rotation lente continue, et PARALLAX souris (toute la scène
// s'incline doucement vers le pointeur).
function InkScene() {
  const group = useRef<Group>(null);
  const blob = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y = MathUtils.lerp(
        group.current.rotation.y,
        state.pointer.x * 0.5,
        0.05,
      );
      group.current.rotation.x = MathUtils.lerp(
        group.current.rotation.x,
        -state.pointer.y * 0.35,
        0.05,
      );
    }
    if (blob.current) {
      blob.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.4}>
        <mesh ref={blob} scale={1.55}>
          <sphereGeometry args={[1, 96, 96]} />
          <MeshDistortMaterial
            color="#e5302a"
            roughness={0.15}
            metalness={0.55}
            distort={0.55}
            speed={2.6}
          />
        </mesh>
      </Float>
      <Sparkles
        count={90}
        scale={7}
        size={2.6}
        speed={0.35}
        color="#f4f1ea"
        opacity={0.55}
      />
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 4, 4]} intensity={2.6} />
      <pointLight position={[-4, -2, -3]} intensity={7} color="#e5302a" />
      <pointLight position={[3, -3, 2]} intensity={3} color="#b71f1a" />
      <InkScene />
    </Canvas>
  );
}
