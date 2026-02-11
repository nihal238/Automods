import { Suspense, useRef, useImperativeHandle, forwardRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows, AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import * as THREE from "three";
import RealisticCarModel from "./RealisticCarModel";
import { ShowroomEnvironment, StudioLighting } from "./ShowroomEnvironment";

export interface CarCustomization {
  bodyColor: string;
  wheelType: "standard" | "sport" | "luxury" | "offroad";
  headlightType: "standard" | "led" | "xenon" | "projector";
  bumperType: "standard" | "sport" | "aggressive" | "minimal";
  spoilerType: "none" | "lip" | "wing" | "gt";
  decalType: "none" | "racing" | "flames" | "tribal" | "geometric";
  ppfType: "none" | "gloss" | "matte" | "satin" | "ceramic";
}

interface RealisticCustomizerSceneProps {
  customization: CarCustomization;
  autoRotate: boolean;
}

export interface RealisticCustomizerSceneRef {
  captureScreenshot: () => Promise<string | null>;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 0.5, 2]} />
      <meshStandardMaterial color="#333333" wireframe />
    </mesh>
  );
}

function Scene({ customization, autoRotate }: RealisticCustomizerSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[6, 3, 6]} fov={40} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={4}
        maxDistance={15}
        dampingFactor={0.08}
        enableDamping
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        target={[0, 0.6, 0]}
      />
      
      {/* Studio Lighting */}
      <StudioLighting />
      
      {/* HDRI Environment for realistic reflections */}
      <Environment preset="night" background={false} />
      
      {/* Static Showroom Environment (doesn't rotate with car) */}
      <ShowroomEnvironment />
      
      {/* High-quality contact shadows */}
      <ContactShadows 
        position={[0, 0.01, 0]} 
        opacity={0.6} 
        scale={14} 
        blur={3} 
        far={5}
        color="#000000"
      />
      
      {/* The car model */}
      <RealisticCarModel 
        {...customization} 
        autoRotate={autoRotate} 
      />
      
      {/* Fog for depth */}
      <fog attach="fog" args={["#0a0a12", 15, 35]} />
    </>
  );
}

const RealisticCustomizerScene = forwardRef<RealisticCustomizerSceneRef, RealisticCustomizerSceneProps>(
  ({ customization, autoRotate }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      captureScreenshot: async () => {
        if (canvasRef.current) {
          return canvasRef.current.toDataURL("image/png");
        }
        return null;
      },
    }));

    return (
      <div className="w-full h-full" style={{ minHeight: '300px' }}>
      <Canvas
        ref={canvasRef}
        shadows
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
        camera={{ position: [6, 3, 6], fov: 40 }}
      >
        <color attach="background" args={["#0a0a12"]} />
        <Suspense fallback={<LoadingFallback />}>
          <Scene customization={customization} autoRotate={autoRotate} />
          <Preload all />
        </Suspense>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
      </div>
    );
  }
);

RealisticCustomizerScene.displayName = "RealisticCustomizerScene";

export default RealisticCustomizerScene;
