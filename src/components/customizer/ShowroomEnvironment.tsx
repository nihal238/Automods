import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ShowroomEnvironmentProps {
  showGrid?: boolean;
}

export function ShowroomEnvironment({ showGrid = true }: ShowroomEnvironmentProps) {
  const floorRef = useRef<THREE.Mesh>(null);
  
  return (
    <group>
      {/* Main floor - Polished concrete look */}
      <mesh 
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <circleGeometry args={[20, 64]} />
        <meshPhysicalMaterial 
          color="#1a1a1f"
          metalness={0.2}
          roughness={0.3}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Reflective center platform */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.001, 0]}
        receiveShadow
      >
        <circleGeometry args={[5, 64]} />
        <meshPhysicalMaterial 
          color="#0f0f12"
          metalness={0.95}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Platform edge ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[4.9, 5.1, 64]} />
        <meshStandardMaterial 
          color="#e63946"
          emissive="#e63946"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Grid pattern on platform */}
      {showGrid && (
        <gridHelper 
          args={[10, 40, "#333340", "#252530"]} 
          position={[0, 0.002, 0]}
        />
      )}
      
      {/* Background curved wall - Showroom backdrop */}
      <mesh position={[0, 5, -12]} rotation={[0, 0, 0]}>
        <planeGeometry args={[40, 15]} />
        <meshStandardMaterial 
          color="#0a0a0f"
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      
      {/* Side walls */}
      <mesh position={[-12, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[30, 15]} />
        <meshStandardMaterial 
          color="#0c0c12"
          metalness={0.1}
          roughness={0.85}
        />
      </mesh>
      <mesh position={[12, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[30, 15]} />
        <meshStandardMaterial 
          color="#0c0c12"
          metalness={0.1}
          roughness={0.85}
        />
      </mesh>
      
      {/* Accent lighting strips on floor */}
      <mesh position={[0, 0.005, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 0.05]} />
        <meshStandardMaterial 
          color="#e63946"
          emissive="#e63946"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0, 0.005, -6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 0.05]} />
        <meshStandardMaterial 
          color="#e63946"
          emissive="#e63946"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// Premium studio lighting setup for realistic car rendering
export function StudioLighting() {
  return (
    <group>
      {/* Main key light - Warm, powerful */}
      <spotLight
        position={[8, 12, 8]}
        angle={0.3}
        penumbra={0.8}
        intensity={2.5}
        color="#fff5e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light - Cool, softer */}
      <spotLight
        position={[-8, 10, -5]}
        angle={0.4}
        penumbra={0.9}
        intensity={1.2}
        color="#e6f0ff"
        castShadow={false}
      />
      
      {/* Rim light - Back highlight */}
      <spotLight
        position={[0, 8, -10]}
        angle={0.35}
        penumbra={0.7}
        intensity={1.5}
        color="#ffffff"
        castShadow={false}
      />
      
      {/* Under-car accent light */}
      <pointLight
        position={[0, 0.3, 0]}
        intensity={0.3}
        color="#e63946"
        distance={4}
        decay={2}
      />
      
      {/* Front accent */}
      <pointLight
        position={[-4, 2, 4]}
        intensity={0.5}
        color="#ff6b6b"
        distance={8}
        decay={2}
      />
      
      {/* Ambient fill */}
      <ambientLight intensity={0.25} color="#e8e8ff" />
      
      {/* Hemisphere light for natural gradient */}
      <hemisphereLight
        color="#ffffff"
        groundColor="#1a1a2e"
        intensity={0.4}
      />
      
      {/* Top softbox simulation */}
      <rectAreaLight
        width={6}
        height={6}
        intensity={3}
        color="#ffffff"
        position={[0, 10, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      
      {/* Side softboxes */}
      <rectAreaLight
        width={3}
        height={5}
        intensity={1.5}
        color="#fff8f0"
        position={[6, 4, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <rectAreaLight
        width={3}
        height={5}
        intensity={1.5}
        color="#f0f8ff"
        position={[-6, 4, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
    </group>
  );
}

export default ShowroomEnvironment;
