import { Suspense, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { Palette, RotateCcw, Save, Share2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCarBrands, useCarModels } from "@/hooks/useCarData";
import { useServices } from "@/hooks/useServices";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import * as THREE from "three";

// Simple 3D Car Component
function CarModel({ color }: { color: string }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[0, -0.5, 0]}>
      {/* Car Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3, 0.8, 1.4]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Car Top/Cabin */}
      <mesh position={[0.2, 1.1, 0]}>
        <boxGeometry args={[1.8, 0.6, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Front Hood Slope */}
      <mesh position={[-1, 0.7, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.8, 0.3, 1.3]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Windows - Front */}
      <mesh position={[-0.5, 1.1, 0]}>
        <boxGeometry args={[0.1, 0.4, 1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Windows - Rear */}
      <mesh position={[1, 1.1, 0]}>
        <boxGeometry args={[0.1, 0.4, 1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Wheels */}
      {[
        [-1, 0, 0.7],
        [-1, 0, -0.7],
        [1, 0, 0.7],
        [1, 0, -0.7],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.2, 32]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.22, 6]} />
            <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Headlights */}
      <mesh position={[-1.5, 0.5, 0.4]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-1.5, 0.5, -0.4]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>

      {/* Taillights */}
      <mesh position={[1.5, 0.5, 0.4]}>
        <boxGeometry args={[0.1, 0.15, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[1.5, 0.5, -0.4]}>
        <boxGeometry args={[0.1, 0.15, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>

      {/* Ground plane for shadow/reflection effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#0a0a0f" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Scene({ color }: { color: string }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[4, 2, 4]} fov={50} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={4}
        maxDistance={10}
      />
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />
      <spotLight position={[-10, 10, -5]} angle={0.3} penumbra={1} intensity={0.5} color="#ff4444" />
      <pointLight position={[0, 5, 0]} intensity={0.5} />
      <Environment preset="night" />
      <CarModel color={color} />
    </>
  );
}

const Customize = () => {
  const [selectedColor, setSelectedColor] = useState("#e63946");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedMods, setSelectedMods] = useState<string[]>([]);

  const { brands, loading: brandsLoading } = useCarBrands();
  const { models, loading: modelsLoading } = useCarModels(selectedBrand || undefined);
  const { services, loading: servicesLoading } = useServices();
  const { user } = useAuth();

  const colors = [
    { name: "Racing Red", value: "#e63946" },
    { name: "Midnight Black", value: "#0a0a0f" },
    { name: "Pearl White", value: "#f1f1f1" },
    { name: "Electric Blue", value: "#0077b6" },
    { name: "Sunset Orange", value: "#f77f00" },
    { name: "Emerald Green", value: "#2d6a4f" },
    { name: "Royal Purple", value: "#7209b7" },
    { name: "Gunmetal Grey", value: "#495057" },
  ];

  const toggleMod = (modId: string) => {
    setSelectedMods((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    );
  };

  const totalCost = selectedMods.reduce((acc, modId) => {
    const service = services.find((s) => s.id === modId);
    return acc + (service?.base_price || 0);
  }, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const selectedBrandData = brands.find((b) => b.id === selectedBrand);
  const selectedModelData = models.find((m) => m.id === selectedModel);

  const handleSaveDesign = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save designs",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Design Saved!",
      description: "Your custom design has been saved to your account",
    });
  };

  const handleShare = () => {
    toast({
      title: "Link Copied!",
      description: "Share link has been copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row">
          {/* 3D Viewer */}
          <div className="flex-1 relative bg-gradient-to-b from-background via-secondary/20 to-background">
            <Canvas shadows>
              <Suspense fallback={null}>
                <Scene color={selectedColor} />
              </Suspense>
            </Canvas>

            {/* Overlay Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              <Button variant="glass" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset View
              </Button>
              <Button variant="glass" size="sm" className="gap-2" onClick={handleSaveDesign}>
                <Save className="h-4 w-4" />
                Save Design
              </Button>
              <Button variant="glass" size="sm" className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            {/* Current Car Badge */}
            <div className="absolute top-6 left-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/30"
              >
                <p className="text-xs text-muted-foreground">Currently Viewing</p>
                <p className="font-display font-bold">
                  {selectedBrandData && selectedModelData
                    ? `${selectedBrandData.name} ${selectedModelData.name}`
                    : "Select a car model"}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Customization Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-96 border-l border-border/30 bg-card/50 backdrop-blur-xl overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg">3D Customizer</h2>
                  <p className="text-xs text-muted-foreground">Visualize your mods</p>
                </div>
              </div>

              {/* Brand Selection */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Select Brand</CardTitle>
                </CardHeader>
                <CardContent>
                  {brandsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {brands.slice(0, 6).map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => {
                            setSelectedBrand(brand.id);
                            setSelectedModel(null);
                          }}
                          className={`p-3 rounded-lg border text-left transition-all duration-300 ${
                            selectedBrand === brand.id
                              ? "border-primary bg-primary/10"
                              : "border-border/50 bg-secondary/30 hover:border-primary/30"
                          }`}
                        >
                          <p className="text-xs text-muted-foreground">{brand.logo_code}</p>
                          <p className="font-medium text-sm">{brand.name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Model Selection */}
              {selectedBrand && (
                <Card variant="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Select Model</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {modelsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`p-3 rounded-lg border text-left transition-all duration-300 ${
                              selectedModel === model.id
                                ? "border-primary bg-primary/10"
                                : "border-border/50 bg-secondary/30 hover:border-primary/30"
                            }`}
                          >
                            <p className="font-medium text-sm">{model.name}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Color Selection */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Paint Color
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`aspect-square rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                          selectedColor === color.value
                            ? "border-primary shadow-neon"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Selected: {colors.find((c) => c.value === selectedColor)?.name}
                  </p>
                </CardContent>
              </Card>

              {/* Modifications */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Modifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {servicesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    services.slice(0, 5).map((service) => (
                      <button
                        key={service.id}
                        onClick={() => toggleMod(service.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                          selectedMods.includes(service.id)
                            ? "border-primary/30 bg-primary/5"
                            : "border-border/50 bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded border-2 ${
                              selectedMods.includes(service.id)
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          />
                          <span className="text-sm">{service.name}</span>
                        </div>
                        <span className="text-sm font-display text-primary">
                          {formatPrice(service.base_price)}
                        </span>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Total & CTA */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <span className="font-display font-bold">Total Cost</span>
                  <span className="font-display font-bold text-xl text-gradient">
                    {formatPrice(totalCost)}
                  </span>
                </div>

                <Button variant="hero" className="w-full">
                  Get Quote for This Build
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Customize;
