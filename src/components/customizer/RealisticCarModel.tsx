import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RealisticCarModelProps {
  bodyColor: string;
  wheelType: "standard" | "sport" | "luxury" | "offroad";
  headlightType: "standard" | "led" | "xenon" | "projector";
  bumperType: "standard" | "sport" | "aggressive" | "minimal";
  spoilerType: "none" | "lip" | "wing" | "gt";
  decalType: "none" | "racing" | "flames" | "tribal" | "geometric";
  ppfType: "none" | "gloss" | "matte" | "satin" | "ceramic";
  autoRotate: boolean;
}

// Enhanced wheel configurations with realistic materials
const wheelConfigs = {
  standard: { spokes: 6, rimColor: "#666666", hubColor: "#333333", size: 0.34, thickness: 0.22 },
  sport: { spokes: 10, rimColor: "#1a1a1a", hubColor: "#ff0000", size: 0.35, thickness: 0.24 },
  luxury: { spokes: 12, rimColor: "#c0c0c0", hubColor: "#d4af37", size: 0.36, thickness: 0.20 },
  offroad: { spokes: 5, rimColor: "#2a2a2a", hubColor: "#4a4a4a", size: 0.40, thickness: 0.28 },
};

// Headlight configurations with realistic glow
const headlightConfigs = {
  standard: { color: "#fffce8", emissive: "#fff5cc", intensity: 0.4, size: 1.0 },
  led: { color: "#ffffff", emissive: "#ffffff", intensity: 1.2, size: 1.1 },
  xenon: { color: "#d4e5ff", emissive: "#6ba4ff", intensity: 0.9, size: 1.05 },
  projector: { color: "#fff8e0", emissive: "#ffcc00", intensity: 0.7, size: 1.15 },
};

// PPF (Paint Protection Film) material properties
const ppfConfigs = {
  none: { clearcoat: 0.8, clearcoatRoughness: 0.1, metalness: 0.9, roughness: 0.15 },
  gloss: { clearcoat: 1.0, clearcoatRoughness: 0.02, metalness: 0.95, roughness: 0.05 },
  matte: { clearcoat: 0.3, clearcoatRoughness: 0.8, metalness: 0.7, roughness: 0.6 },
  satin: { clearcoat: 0.6, clearcoatRoughness: 0.4, metalness: 0.85, roughness: 0.25 },
  ceramic: { clearcoat: 1.0, clearcoatRoughness: 0.01, metalness: 0.98, roughness: 0.02 },
};

// Decal colors with proper contrast
const decalColors = {
  none: null,
  racing: "#ffffff",
  flames: "#ff4500",
  tribal: "#0a0a0a",
  geometric: "#00d4ff",
};

function Wheel({ position, config, rotation = 0 }: { position: [number, number, number], config: typeof wheelConfigs.standard, rotation?: number }) {
  const wheelRef = useRef<THREE.Group>(null);

  const tireRadius = config.size;
  const rimRadius = config.size * 0.68;
  const tireWidth = config.thickness;

  return (
    <group position={position}>
      <group ref={wheelRef} rotation={[Math.PI / 2, 0, rotation]}>
        {/* Outer tire */}
        <mesh>
          <cylinderGeometry args={[tireRadius, tireRadius, tireWidth, 48]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.92} metalness={0.05} />
        </mesh>
        
        {/* Tire sidewall inner ring left */}
        <mesh position={[0, tireWidth / 2, 0]}>
          <ringGeometry args={[rimRadius + 0.02, tireRadius, 48]} />
          <meshStandardMaterial color="#222222" roughness={0.85} metalness={0.05} />
        </mesh>
        {/* Tire sidewall inner ring right */}
        <mesh position={[0, -tireWidth / 2, 0]} rotation={[Math.PI, 0, 0]}>
          <ringGeometry args={[rimRadius + 0.02, tireRadius, 48]} />
          <meshStandardMaterial color="#222222" roughness={0.85} metalness={0.05} />
        </mesh>
        
        {/* Rim */}
        <mesh>
          <cylinderGeometry args={[rimRadius, rimRadius, tireWidth + 0.02, config.spokes * 2]} />
          <meshPhysicalMaterial 
            color={config.rimColor} 
            metalness={0.98} 
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>
        
        {/* Rim face / hub */}
        <mesh position={[0, tireWidth / 2 + 0.01, 0]}>
          <circleGeometry args={[rimRadius, config.spokes * 2]} />
          <meshPhysicalMaterial 
            color={config.rimColor} 
            metalness={0.95} 
            roughness={0.1}
            clearcoat={0.8}
          />
        </mesh>
        
        {/* Center hub cap */}
        <mesh position={[0, tireWidth / 2 + 0.02, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 32]} />
          <meshPhysicalMaterial 
            color={config.hubColor} 
            metalness={0.95} 
            roughness={0.15}
            clearcoat={0.8}
          />
        </mesh>
        
        {/* Lug nuts */}
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          const lx = Math.cos(angle) * 0.065;
          const lz = Math.sin(angle) * 0.065;
          return (
            <mesh key={i} position={[lx, tireWidth / 2 + 0.025, lz]}>
              <cylinderGeometry args={[0.012, 0.012, 0.02, 6]} />
              <meshStandardMaterial color="#999999" metalness={0.9} roughness={0.2} />
            </mesh>
          );
        })}
        
        {/* Brake disc */}
        <mesh>
          <cylinderGeometry args={[rimRadius * 0.75, rimRadius * 0.75, 0.04, 48]} />
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.35} />
        </mesh>
      </group>
    </group>
  );
}

function CarBody({ bodyColor, ppfType, bumperType }: { bodyColor: string, ppfType: keyof typeof ppfConfigs, bumperType: string }) {
  const ppf = ppfConfigs[ppfType];
  
  // Create car body material with PPF properties
  const bodyMaterial = useMemo(() => (
    <meshPhysicalMaterial 
      color={bodyColor} 
      metalness={ppf.metalness}
      roughness={ppf.roughness}
      clearcoat={ppf.clearcoat}
      clearcoatRoughness={ppf.clearcoatRoughness}
      envMapIntensity={1.5}
    />
  ), [bodyColor, ppf]);

  return (
    <group>
      {/* Main Body Shell - Lower */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[3.4, 0.5, 1.6]} />
        {bodyMaterial}
      </mesh>
      
      {/* Body - Side panels with curvature simulation */}
      <mesh position={[0, 0.55, 0.82]}>
        <boxGeometry args={[3.2, 0.4, 0.08]} />
        {bodyMaterial}
      </mesh>
      <mesh position={[0, 0.55, -0.82]}>
        <boxGeometry args={[3.2, 0.4, 0.08]} />
        {bodyMaterial}
      </mesh>
      
      {/* Wheel arches - Front */}
      <mesh position={[-1.0, 0.35, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.08, 8, 16, Math.PI]} />
        {bodyMaterial}
      </mesh>
      <mesh position={[-1.0, 0.35, -0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.08, 8, 16, Math.PI]} />
        {bodyMaterial}
      </mesh>
      
      {/* Wheel arches - Rear */}
      <mesh position={[1.0, 0.35, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.08, 8, 16, Math.PI]} />
        {bodyMaterial}
      </mesh>
      <mesh position={[1.0, 0.35, -0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.08, 8, 16, Math.PI]} />
        {bodyMaterial}
      </mesh>
      
      {/* Cabin/Greenhouse */}
      <mesh position={[0.15, 1.0, 0]}>
        <boxGeometry args={[1.8, 0.5, 1.45]} />
        {bodyMaterial}
      </mesh>
      
      {/* Roof */}
      <mesh position={[0.1, 1.28, 0]}>
        <boxGeometry args={[1.6, 0.08, 1.35]} />
        {bodyMaterial}
      </mesh>
      
      {/* Hood - Sloped */}
      <mesh position={[-1.15, 0.68, 0]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[1.1, 0.12, 1.5]} />
        {bodyMaterial}
      </mesh>
      
      {/* Hood vents for sport look */}
      <mesh position={[-0.9, 0.72, 0.25]}>
        <boxGeometry args={[0.4, 0.03, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-0.9, 0.72, -0.25]}>
        <boxGeometry args={[0.4, 0.03, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Trunk/Rear deck */}
      <mesh position={[1.25, 0.72, 0]} rotation={[0, 0, 0.12]}>
        <boxGeometry args={[0.7, 0.1, 1.45]} />
        {bodyMaterial}
      </mesh>
      
      {/* A-Pillar */}
      <mesh position={[-0.65, 0.95, 0.68]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.4, 0.1, 0.08]} />
        {bodyMaterial}
      </mesh>
      <mesh position={[-0.65, 0.95, -0.68]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.4, 0.1, 0.08]} />
        {bodyMaterial}
      </mesh>
      
      {/* C-Pillar */}
      <mesh position={[0.85, 0.95, 0.68]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.35, 0.1, 0.08]} />
        {bodyMaterial}
      </mesh>
      <mesh position={[0.85, 0.95, -0.68]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.35, 0.1, 0.08]} />
        {bodyMaterial}
      </mesh>
      
      {/* Front Bumper */}
      <mesh position={[-1.72, 0.32, 0]}>
        <boxGeometry args={[
          bumperType === "aggressive" ? 0.22 : 0.14,
          bumperType === "sport" ? 0.38 : bumperType === "minimal" ? 0.25 : 0.32,
          bumperType === "minimal" ? 1.35 : 1.65
        ]} />
        <meshPhysicalMaterial 
          color={bumperType === "sport" || bumperType === "aggressive" ? bodyColor : "#151515"} 
          metalness={0.7} 
          roughness={0.35}
          clearcoat={0.5}
        />
      </mesh>
      
      {/* Lower front grille */}
      <mesh position={[-1.71, 0.22, 0]}>
        <boxGeometry args={[0.04, 0.12, 0.9]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.4} />
      </mesh>
      
      {/* Upper grille */}
      <mesh position={[-1.69, 0.48, 0]}>
        <boxGeometry args={[0.04, 0.18, 0.6]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Rear Bumper */}
      <mesh position={[1.72, 0.32, 0]}>
        <boxGeometry args={[
          bumperType === "aggressive" ? 0.22 : 0.14,
          bumperType === "sport" ? 0.38 : bumperType === "minimal" ? 0.25 : 0.32,
          bumperType === "minimal" ? 1.35 : 1.65
        ]} />
        <meshPhysicalMaterial 
          color={bumperType === "sport" || bumperType === "aggressive" ? bodyColor : "#151515"} 
          metalness={0.7} 
          roughness={0.35}
          clearcoat={0.5}
        />
      </mesh>
      
      {/* Exhaust tips */}
      <mesh position={[1.75, 0.2, 0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.05, 0.12, 16]} />
        <meshStandardMaterial color="#404040" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[1.75, 0.2, -0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.05, 0.12, 16]} />
        <meshStandardMaterial color="#404040" metalness={0.95} roughness={0.15} />
      </mesh>
      
      {/* Side skirts */}
      <mesh position={[0, 0.18, 0.78]}>
        <boxGeometry args={[2.4, 0.08, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.18, -0.78]}>
        <boxGeometry args={[2.4, 0.08, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Door handles */}
      <mesh position={[-0.25, 0.6, 0.82]}>
        <boxGeometry args={[0.12, 0.03, 0.04]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.4, 0.6, 0.82]}>
        <boxGeometry args={[0.12, 0.03, 0.04]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.25, 0.6, -0.82]}>
        <boxGeometry args={[0.12, 0.03, 0.04]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.4, 0.6, -0.82]}>
        <boxGeometry args={[0.12, 0.03, 0.04]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Side mirrors */}
      <mesh position={[-0.55, 0.85, 0.85]}>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        {bodyMaterial}
      </mesh>
      <mesh position={[-0.55, 0.85, -0.85]}>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        {bodyMaterial}
      </mesh>
      {/* Mirror glass */}
      <mesh position={[-0.54, 0.85, 0.92]}>
        <boxGeometry args={[0.06, 0.045, 0.01]} />
        <meshStandardMaterial color="#333333" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[-0.54, 0.85, -0.92]}>
        <boxGeometry args={[0.06, 0.045, 0.01]} />
        <meshStandardMaterial color="#333333" metalness={0.95} roughness={0.05} />
      </mesh>
    </group>
  );
}

function Windows() {
  const glassMaterial = (
    <meshPhysicalMaterial 
      color="#0a0a15" 
      metalness={0.1}
      roughness={0.05}
      transmission={0.6}
      thickness={0.1}
      transparent
      opacity={0.85}
    />
  );

  return (
    <group>
      {/* Windshield */}
      <mesh position={[-0.52, 1.0, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.65, 0.04, 1.28]} />
        {glassMaterial}
      </mesh>
      
      {/* Rear windshield */}
      <mesh position={[0.88, 1.0, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.55, 0.04, 1.15]} />
        {glassMaterial}
      </mesh>
      
      {/* Side windows - Left */}
      <mesh position={[0.15, 1.0, 0.72]}>
        <boxGeometry args={[1.2, 0.38, 0.03]} />
        {glassMaterial}
      </mesh>
      
      {/* Side windows - Right */}
      <mesh position={[0.15, 1.0, -0.72]}>
        <boxGeometry args={[1.2, 0.38, 0.03]} />
        {glassMaterial}
      </mesh>
      
      {/* Quarter windows */}
      <mesh position={[0.72, 1.02, 0.69]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.25, 0.28, 0.02]} />
        {glassMaterial}
      </mesh>
      <mesh position={[0.72, 1.02, -0.69]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.25, 0.28, 0.02]} />
        {glassMaterial}
      </mesh>
    </group>
  );
}

function Headlights({ config }: { config: typeof headlightConfigs.standard }) {
  return (
    <group>
      {/* Left headlight housing */}
      <mesh position={[-1.68, 0.52, 0.5]}>
        <boxGeometry args={[0.08, 0.18, 0.32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Left headlight lens */}
      <mesh position={[-1.72, 0.52, 0.5]}>
        <boxGeometry args={[0.02, 0.14, 0.28]} />
        <meshPhysicalMaterial 
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={config.intensity}
          transmission={0.5}
          transparent
        />
      </mesh>
      
      {/* Right headlight housing */}
      <mesh position={[-1.68, 0.52, -0.5]}>
        <boxGeometry args={[0.08, 0.18, 0.32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Right headlight lens */}
      <mesh position={[-1.72, 0.52, -0.5]}>
        <boxGeometry args={[0.02, 0.14, 0.28]} />
        <meshPhysicalMaterial 
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={config.intensity}
          transmission={0.5}
          transparent
        />
      </mesh>
      
      {/* DRL strips */}
      <mesh position={[-1.72, 0.42, 0.5]}>
        <boxGeometry args={[0.01, 0.02, 0.25]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-1.72, 0.42, -0.5]}>
        <boxGeometry args={[0.01, 0.02, 0.25]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function Taillights() {
  return (
    <group>
      {/* Left taillight */}
      <mesh position={[1.7, 0.55, 0.55]}>
        <boxGeometry args={[0.06, 0.14, 0.35]} />
        <meshPhysicalMaterial 
          color="#ff1a1a"
          emissive="#ff0000"
          emissiveIntensity={0.7}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Right taillight */}
      <mesh position={[1.7, 0.55, -0.55]}>
        <boxGeometry args={[0.06, 0.14, 0.35]} />
        <meshPhysicalMaterial 
          color="#ff1a1a"
          emissive="#ff0000"
          emissiveIntensity={0.7}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Center strip (modern look) */}
      <mesh position={[1.7, 0.58, 0]}>
        <boxGeometry args={[0.03, 0.04, 0.7]} />
        <meshStandardMaterial 
          color="#330000"
          emissive="#660000"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Reverse lights */}
      <mesh position={[1.71, 0.48, 0.45]}>
        <boxGeometry args={[0.02, 0.06, 0.08]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.2} />
      </mesh>
      <mesh position={[1.71, 0.48, -0.45]}>
        <boxGeometry args={[0.02, 0.06, 0.08]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Spoiler({ type, bodyColor }: { type: string, bodyColor: string }) {
  if (type === "none") return null;
  
  const height = type === "gt" ? 1.55 : type === "wing" ? 1.35 : 1.18;
  const width = type === "lip" ? 1.25 : 1.45;
  const thickness = type === "gt" ? 0.1 : type === "wing" ? 0.06 : 0.04;
  
  return (
    <group position={[1.35, height, 0]}>
      {/* Spoiler blade */}
      <mesh>
        <boxGeometry args={[
          type === "lip" ? 0.18 : 0.28,
          thickness,
          width
        ]} />
        <meshPhysicalMaterial 
          color={bodyColor} 
          metalness={0.9} 
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
      
      {/* Spoiler endplates for wing/GT */}
      {(type === "wing" || type === "gt") && (
        <>
          <mesh position={[0.08, 0, width / 2 - 0.02]}>
            <boxGeometry args={[0.2, type === "gt" ? 0.2 : 0.12, 0.04]} />
            <meshPhysicalMaterial color={bodyColor} metalness={0.9} roughness={0.1} clearcoat={1} />
          </mesh>
          <mesh position={[0.08, 0, -(width / 2 - 0.02)]}>
            <boxGeometry args={[0.2, type === "gt" ? 0.2 : 0.12, 0.04]} />
            <meshPhysicalMaterial color={bodyColor} metalness={0.9} roughness={0.1} clearcoat={1} />
          </mesh>
        </>
      )}
      
      {/* Spoiler stands */}
      {(type === "wing" || type === "gt") && (
        <>
          <mesh position={[-0.05, -(height - 1.15) / 2, 0.45]}>
            <boxGeometry args={[0.05, height - 1.1, 0.05]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.05, -(height - 1.15) / 2, -0.45]}>
            <boxGeometry args={[0.05, height - 1.1, 0.05]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}
    </group>
  );
}

function Decals({ type, bodyColor }: { type: string, bodyColor: string }) {
  if (type === "none" || !decalColors[type as keyof typeof decalColors]) return null;
  
  const color = decalColors[type as keyof typeof decalColors]!;
  
  return (
    <group>
      {type === "racing" && (
        <>
          {/* Racing stripes on hood */}
          <mesh position={[-0.9, 0.76, 0.18]} rotation={[0, 0, -0.18]}>
            <boxGeometry args={[0.9, 0.015, 0.08]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
          </mesh>
          <mesh position={[-0.9, 0.76, -0.18]} rotation={[0, 0, -0.18]}>
            <boxGeometry args={[0.9, 0.015, 0.08]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
          </mesh>
          {/* Roof stripes */}
          <mesh position={[0.1, 1.295, 0.18]}>
            <boxGeometry args={[1.5, 0.012, 0.08]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
          </mesh>
          <mesh position={[0.1, 1.295, -0.18]}>
            <boxGeometry args={[1.5, 0.012, 0.08]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
          </mesh>
          {/* Side stripes */}
          <mesh position={[0, 0.55, 0.84]}>
            <boxGeometry args={[2.5, 0.12, 0.012]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.55, -0.84]}>
            <boxGeometry args={[2.5, 0.12, 0.012]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
          </mesh>
        </>
      )}
      
      {type === "flames" && (
        <>
          <mesh position={[-0.7, 0.52, 0.83]} rotation={[0, 0, -0.15]}>
            <boxGeometry args={[1.2, 0.25, 0.012]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[-0.7, 0.52, -0.83]} rotation={[0, 0, -0.15]}>
            <boxGeometry args={[1.2, 0.25, 0.012]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
          </mesh>
        </>
      )}
      
      {type === "tribal" && (
        <>
          <mesh position={[0.4, 0.92, 0.725]}>
            <boxGeometry args={[0.7, 0.25, 0.012]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.7} />
          </mesh>
          <mesh position={[0.4, 0.92, -0.725]}>
            <boxGeometry args={[0.7, 0.25, 0.012]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.7} />
          </mesh>
        </>
      )}
      
      {type === "geometric" && (
        <>
          <mesh position={[-0.2, 0.52, 0.83]}>
            <boxGeometry args={[0.35, 0.35, 0.012]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0.35, 0.52, 0.83]}>
            <boxGeometry args={[0.28, 0.28, 0.012]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[-0.2, 0.52, -0.83]}>
            <boxGeometry args={[0.35, 0.35, 0.012]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0.35, 0.52, -0.83]}>
            <boxGeometry args={[0.28, 0.28, 0.012]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
          </mesh>
        </>
      )}
    </group>
  );
}

export function RealisticCarModel({
  bodyColor,
  wheelType,
  headlightType,
  bumperType,
  spoilerType,
  decalType,
  ppfType,
  autoRotate,
}: RealisticCarModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelConfig = wheelConfigs[wheelType];
  const headlightConfig = headlightConfigs[headlightType];

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  // Wheels sit on ground: center Y = tire radius so bottom touches y=0
  const wheelY = wheelConfig.size;
  const wheelPositions: [number, number, number][] = [
    [-1.0, wheelY, 0.78],
    [-1.0, wheelY, -0.78],
    [1.0, wheelY, 0.78],
    [1.0, wheelY, -0.78],
  ];

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <CarBody bodyColor={bodyColor} ppfType={ppfType} bumperType={bumperType} />
      <Windows />
      <Headlights config={headlightConfig} />
      <Taillights />
      <Spoiler type={spoilerType} bodyColor={bodyColor} />
      <Decals type={decalType} bodyColor={bodyColor} />
      
      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <Wheel 
          key={i} 
          position={pos} 
          config={wheelConfig}
          rotation={i % 2 === 0 ? 0 : Math.PI}
        />
      ))}
    </group>
  );
}

export default RealisticCarModel;
