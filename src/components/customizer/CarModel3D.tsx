import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CarModel3DProps {
  bodyColor: string;
  wheelType: "standard" | "sport" | "luxury" | "offroad";
  headlightType: "standard" | "led" | "xenon" | "projector";
  bumperType: "standard" | "sport" | "aggressive" | "minimal";
  spoilerType: "none" | "lip" | "wing" | "gt";
  decalType: "none" | "racing" | "flames" | "tribal" | "geometric";
  autoRotate: boolean;
}

// Wheel configurations
const wheelConfigs = {
  standard: { spokes: 6, color: "#888888", size: 0.35 },
  sport: { spokes: 8, color: "#333333", size: 0.36 },
  luxury: { spokes: 10, color: "#c0c0c0", size: 0.38 },
  offroad: { spokes: 5, color: "#4a4a4a", size: 0.40 },
};

// Headlight configurations
const headlightConfigs = {
  standard: { color: "#ffffff", emissive: "#ffff00", intensity: 0.5 },
  led: { color: "#ffffff", emissive: "#ffffff", intensity: 0.8 },
  xenon: { color: "#e0e8ff", emissive: "#4a90d9", intensity: 0.7 },
  projector: { color: "#ffffff", emissive: "#ffcc00", intensity: 0.6 },
};

// Decal colors
const decalColors = {
  none: null,
  racing: "#ffffff",
  flames: "#ff4500",
  tribal: "#1a1a1a",
  geometric: "#00bcd4",
};

export function CarModel3D({
  bodyColor,
  wheelType,
  headlightType,
  bumperType,
  spoilerType,
  decalType,
  autoRotate,
}: CarModel3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const wheelConfig = wheelConfigs[wheelType];
  const headlightConfig = headlightConfigs[headlightType];

  useFrame((state) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  const wheelPositions: [number, number, number][] = [
    [-1, 0, 0.8],
    [-1, 0, -0.8],
    [1, 0, 0.8],
    [1, 0, -0.8],
  ];

  return (
    <group ref={meshRef} position={[0, -0.5, 0]}>
      {/* Car Body - Main */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3.2, 0.8, 1.5]} />
        <meshStandardMaterial color={bodyColor} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Car Top/Cabin */}
      <mesh position={[0.2, 1.15, 0]}>
        <boxGeometry args={[1.9, 0.65, 1.35]} />
        <meshStandardMaterial color={bodyColor} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Front Hood Slope */}
      <mesh position={[-1.1, 0.75, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.9, 0.35, 1.4]} />
        <meshStandardMaterial color={bodyColor} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Rear Slope */}
      <mesh position={[1.3, 0.8, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.6, 0.3, 1.35]} />
        <meshStandardMaterial color={bodyColor} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Windows - Front Windshield */}
      <mesh position={[-0.55, 1.15, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.08, 0.5, 1.2]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.95} roughness={0.05} transparent opacity={0.9} />
      </mesh>

      {/* Windows - Rear Windshield */}
      <mesh position={[1.05, 1.15, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.08, 0.45, 1.1]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.95} roughness={0.05} transparent opacity={0.9} />
      </mesh>

      {/* Side Windows */}
      <mesh position={[0.2, 1.15, 0.68]}>
        <boxGeometry args={[1.6, 0.4, 0.05]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.95} roughness={0.05} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.2, 1.15, -0.68]}>
        <boxGeometry args={[1.6, 0.4, 0.05]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.95} roughness={0.05} transparent opacity={0.85} />
      </mesh>

      {/* Bumper - Front */}
      <mesh position={[-1.65, 0.35, 0]}>
        <boxGeometry args={[
          bumperType === "aggressive" ? 0.18 : 0.12,
          bumperType === "sport" ? 0.35 : 0.28,
          bumperType === "minimal" ? 1.3 : 1.55
        ]} />
        <meshStandardMaterial 
          color={bumperType === "sport" || bumperType === "aggressive" ? bodyColor : "#1a1a1a"} 
          metalness={0.7} 
          roughness={0.3} 
        />
      </mesh>

      {/* Bumper - Rear */}
      <mesh position={[1.65, 0.35, 0]}>
        <boxGeometry args={[
          bumperType === "aggressive" ? 0.18 : 0.12,
          bumperType === "sport" ? 0.35 : 0.28,
          bumperType === "minimal" ? 1.3 : 1.55
        ]} />
        <meshStandardMaterial 
          color={bumperType === "sport" || bumperType === "aggressive" ? bodyColor : "#1a1a1a"} 
          metalness={0.7} 
          roughness={0.3} 
        />
      </mesh>

      {/* Spoiler */}
      {spoilerType !== "none" && (
        <group position={[1.4, spoilerType === "gt" ? 1.5 : spoilerType === "wing" ? 1.3 : 1.15, 0]}>
          {/* Spoiler blade */}
          <mesh>
            <boxGeometry args={[
              spoilerType === "lip" ? 0.15 : 0.25,
              spoilerType === "gt" ? 0.08 : 0.05,
              spoilerType === "lip" ? 1.2 : 1.4
            ]} />
            <meshStandardMaterial color={bodyColor} metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Spoiler stands */}
          {(spoilerType === "wing" || spoilerType === "gt") && (
            <>
              <mesh position={[0, -0.15, 0.4]}>
                <boxGeometry args={[0.05, 0.3, 0.05]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, -0.15, -0.4]}>
                <boxGeometry args={[0.05, 0.3, 0.05]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
              </mesh>
            </>
          )}
        </group>
      )}

      {/* Decals */}
      {decalType !== "none" && decalColors[decalType] && (
        <>
          {/* Side stripes */}
          {decalType === "racing" && (
            <>
              <mesh position={[0, 0.55, 0.76]}>
                <boxGeometry args={[2.8, 0.15, 0.01]} />
                <meshStandardMaterial color={decalColors.racing} metalness={0.3} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.55, -0.76]}>
                <boxGeometry args={[2.8, 0.15, 0.01]} />
                <meshStandardMaterial color={decalColors.racing} metalness={0.3} roughness={0.5} />
              </mesh>
            </>
          )}
          {decalType === "flames" && (
            <>
              <mesh position={[-0.8, 0.5, 0.76]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[1.5, 0.25, 0.01]} />
                <meshStandardMaterial color={decalColors.flames} metalness={0.3} roughness={0.5} />
              </mesh>
              <mesh position={[-0.8, 0.5, -0.76]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[1.5, 0.25, 0.01]} />
                <meshStandardMaterial color={decalColors.flames} metalness={0.3} roughness={0.5} />
              </mesh>
            </>
          )}
          {decalType === "tribal" && (
            <>
              <mesh position={[0.5, 0.9, 0.685]}>
                <boxGeometry args={[0.8, 0.3, 0.01]} />
                <meshStandardMaterial color={decalColors.tribal} metalness={0.2} roughness={0.6} />
              </mesh>
              <mesh position={[0.5, 0.9, -0.685]}>
                <boxGeometry args={[0.8, 0.3, 0.01]} />
                <meshStandardMaterial color={decalColors.tribal} metalness={0.2} roughness={0.6} />
              </mesh>
            </>
          )}
          {decalType === "geometric" && (
            <>
              <mesh position={[-0.3, 0.5, 0.76]}>
                <boxGeometry args={[0.4, 0.4, 0.01]} />
                <meshStandardMaterial color={decalColors.geometric} metalness={0.5} roughness={0.3} />
              </mesh>
              <mesh position={[0.3, 0.5, 0.76]}>
                <boxGeometry args={[0.3, 0.3, 0.01]} />
                <meshStandardMaterial color={decalColors.geometric} metalness={0.5} roughness={0.3} />
              </mesh>
              <mesh position={[-0.3, 0.5, -0.76]}>
                <boxGeometry args={[0.4, 0.4, 0.01]} />
                <meshStandardMaterial color={decalColors.geometric} metalness={0.5} roughness={0.3} />
              </mesh>
              <mesh position={[0.3, 0.5, -0.76]}>
                <boxGeometry args={[0.3, 0.3, 0.01]} />
                <meshStandardMaterial color={decalColors.geometric} metalness={0.5} roughness={0.3} />
              </mesh>
            </>
          )}
        </>
      )}

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Tire */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[wheelConfig.size, wheelConfig.size, 0.22, 32]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[wheelConfig.size * 0.7, wheelConfig.size * 0.7, 0.24, wheelConfig.spokes]} />
            <meshStandardMaterial color={wheelConfig.color} metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.26, 16]} />
            <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* Headlights */}
      <mesh position={[-1.6, 0.55, 0.45]}>
        <boxGeometry args={[0.08, 0.22, 0.28]} />
        <meshStandardMaterial 
          color={headlightConfig.color} 
          emissive={headlightConfig.emissive} 
          emissiveIntensity={headlightConfig.intensity} 
        />
      </mesh>
      <mesh position={[-1.6, 0.55, -0.45]}>
        <boxGeometry args={[0.08, 0.22, 0.28]} />
        <meshStandardMaterial 
          color={headlightConfig.color} 
          emissive={headlightConfig.emissive} 
          emissiveIntensity={headlightConfig.intensity} 
        />
      </mesh>

      {/* Taillights */}
      <mesh position={[1.6, 0.55, 0.45]}>
        <boxGeometry args={[0.08, 0.18, 0.32]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[1.6, 0.55, -0.45]}>
        <boxGeometry args={[0.08, 0.18, 0.32]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>

      {/* Grille */}
      <mesh position={[-1.61, 0.4, 0]}>
        <boxGeometry args={[0.02, 0.2, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Ground plane for reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0a0a0f" metalness={0.95} roughness={0.05} />
      </mesh>
    </group>
  );
}

export default CarModel3D;
