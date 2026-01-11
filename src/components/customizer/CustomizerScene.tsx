import { Suspense, useRef, useImperativeHandle, forwardRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import CarModel3D from "./CarModel3D";

export interface CarCustomization {
  bodyColor: string;
  wheelType: "standard" | "sport" | "luxury" | "offroad";
  headlightType: "standard" | "led" | "xenon" | "projector";
  bumperType: "standard" | "sport" | "aggressive" | "minimal";
  spoilerType: "none" | "lip" | "wing" | "gt";
  decalType: "none" | "racing" | "flames" | "tribal" | "geometric";
}

interface CustomizerSceneProps {
  customization: CarCustomization;
  autoRotate: boolean;
}

export interface CustomizerSceneRef {
  captureScreenshot: () => Promise<string | null>;
}

function Scene({ customization, autoRotate }: CustomizerSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 2.5, 5]} fov={45} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={3.5}
        maxDistance={12}
        dampingFactor={0.05}
        enableDamping
      />
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 12, 8]} angle={0.25} penumbra={1} intensity={1.5} castShadow />
      <spotLight position={[-10, 10, -5]} angle={0.3} penumbra={1} intensity={0.6} color="#4a90d9" />
      <pointLight position={[0, 8, 0]} intensity={0.4} />
      <pointLight position={[-5, 2, 5]} intensity={0.3} color="#ff6b6b" />
      <Environment preset="city" />
      <ContactShadows 
        position={[0, -0.49, 0]} 
        opacity={0.6} 
        scale={15} 
        blur={2.5} 
        far={5} 
      />
      <CarModel3D {...customization} autoRotate={autoRotate} />
    </>
  );
}

const CustomizerScene = forwardRef<CustomizerSceneRef, CustomizerSceneProps>(
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
      <Canvas
        ref={canvasRef}
        shadows
        gl={{ preserveDrawingBuffer: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene customization={customization} autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
    );
  }
);

CustomizerScene.displayName = "CustomizerScene";

export default CustomizerScene;
