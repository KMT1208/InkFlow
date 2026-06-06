"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import type { Mesh } from "three";

// Blob « encre » organique : sphère lisse distordue par le matériau (vertex
// shader), lente rotation continue, suspendue par <Float> pour la vie.
function InkBlob() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.15;
    ref.current.rotation.x += delta * 0.05;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} scale={1.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#e5302a"
          roughness={0.2}
          metalness={0.5}
          distort={0.45}
          speed={2.2}
        />
      </mesh>
    </Float>
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
      <directionalLight position={[4, 4, 4]} intensity={2.4} />
      <pointLight position={[-4, -2, -3]} intensity={6} color="#e5302a" />
      <pointLight position={[3, -3, 2]} intensity={3} color="#b71f1a" />
      <InkBlob />
      <Sparkles
        count={70}
        scale={7}
        size={2.4}
        speed={0.3}
        color="#f4f1ea"
        opacity={0.5}
      />
    </Canvas>
  );
}
