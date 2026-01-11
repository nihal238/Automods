import { motion } from "framer-motion";
import { 
  Palette, 
  CircleDot, 
  Lightbulb, 
  Shield, 
  Wind, 
  Sticker,
  Loader2,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { CarCustomization } from "./CustomizerScene";
import { useState } from "react";

interface CustomizationPanelProps {
  customization: CarCustomization;
  onCustomizationChange: (updates: Partial<CarCustomization>) => void;
  selectedBrand: string | null;
  selectedModel: string | null;
  onBrandChange: (brandId: string) => void;
  onModelChange: (modelId: string) => void;
  brands: Array<{ id: string; name: string; logo_code: string }>;
  models: Array<{ id: string; name: string }>;
  brandsLoading: boolean;
  modelsLoading: boolean;
}

const colors = [
  { name: "Racing Red", value: "#e63946" },
  { name: "Midnight Black", value: "#0a0a0f" },
  { name: "Pearl White", value: "#f1f1f1" },
  { name: "Electric Blue", value: "#0077b6" },
  { name: "Sunset Orange", value: "#f77f00" },
  { name: "Emerald Green", value: "#2d6a4f" },
  { name: "Royal Purple", value: "#7209b7" },
  { name: "Gunmetal Grey", value: "#495057" },
  { name: "Gold Rush", value: "#d4af37" },
  { name: "Candy Pink", value: "#ff69b4" },
  { name: "Ocean Teal", value: "#008b8b" },
  { name: "Matte Military", value: "#4a5d23" },
];

const wheelOptions = [
  { value: "standard", name: "Standard", price: 0 },
  { value: "sport", name: "Sport Alloy", price: 25000 },
  { value: "luxury", name: "Luxury Chrome", price: 45000 },
  { value: "offroad", name: "Off-Road", price: 35000 },
] as const;

const headlightOptions = [
  { value: "standard", name: "Halogen", price: 0 },
  { value: "led", name: "LED", price: 15000 },
  { value: "xenon", name: "Xenon HID", price: 25000 },
  { value: "projector", name: "Projector", price: 35000 },
] as const;

const bumperOptions = [
  { value: "standard", name: "Stock", price: 0 },
  { value: "sport", name: "Sport", price: 20000 },
  { value: "aggressive", name: "Aggressive", price: 35000 },
  { value: "minimal", name: "Minimal", price: 15000 },
] as const;

const spoilerOptions = [
  { value: "none", name: "None", price: 0 },
  { value: "lip", name: "Lip Spoiler", price: 12000 },
  { value: "wing", name: "Wing", price: 28000 },
  { value: "gt", name: "GT Wing", price: 45000 },
] as const;

const decalOptions = [
  { value: "none", name: "None", price: 0 },
  { value: "racing", name: "Racing Stripes", price: 8000 },
  { value: "flames", name: "Flames", price: 12000 },
  { value: "tribal", name: "Tribal", price: 10000 },
  { value: "geometric", name: "Geometric", price: 15000 },
] as const;

export default function CustomizationPanel({
  customization,
  onCustomizationChange,
  selectedBrand,
  selectedModel,
  onBrandChange,
  onModelChange,
  brands,
  models,
  brandsLoading,
  modelsLoading,
}: CustomizationPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    brand: true,
    color: true,
    wheels: false,
    headlights: false,
    bumpers: false,
    spoiler: false,
    decals: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Included";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Brand Selection */}
      <Collapsible open={openSections.brand} onOpenChange={() => toggleSection("brand")}>
        <Card variant="glass">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                🚗 Select Car
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.brand ? "rotate-180" : ""}`} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {brandsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Brand</p>
                    <div className="grid grid-cols-3 gap-2">
                      {brands.slice(0, 9).map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => onBrandChange(brand.id)}
                          className={`p-2 rounded-lg border text-center transition-all duration-300 ${
                            selectedBrand === brand.id
                              ? "border-primary bg-primary/10"
                              : "border-border/50 bg-secondary/30 hover:border-primary/30"
                          }`}
                        >
                          <p className="text-xs font-medium truncate">{brand.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedBrand && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Model</p>
                      {modelsLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {models.map((model) => (
                            <button
                              key={model.id}
                              onClick={() => onModelChange(model.id)}
                              className={`p-2 rounded-lg border text-center transition-all duration-300 ${
                                selectedModel === model.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border/50 bg-secondary/30 hover:border-primary/30"
                              }`}
                            >
                              <p className="text-xs font-medium truncate">{model.name}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Color Selection */}
      <Collapsible open={openSections.color} onOpenChange={() => toggleSection("color")}>
        <Card variant="glass">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Body Color
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.color ? "rotate-180" : ""}`} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <motion.button
                    key={color.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCustomizationChange({ bodyColor: color.value })}
                    className={`aspect-square rounded-lg border-2 transition-all duration-300 ${
                      customization.bodyColor === color.value
                        ? "border-primary shadow-neon ring-2 ring-primary/50"
                        : "border-transparent hover:border-primary/30"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {colors.find((c) => c.value === customization.bodyColor)?.name || "Custom"}
              </p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Wheels */}
      <Collapsible open={openSections.wheels} onOpenChange={() => toggleSection("wheels")}>
        <Card variant="glass">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <CircleDot className="h-4 w-4 text-primary" />
                Wheels & Rims
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.wheels ? "rotate-180" : ""}`} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2">
              {wheelOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onCustomizationChange({ wheelType: option.value })}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                    customization.wheelType === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-secondary/30 hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm">{option.name}</span>
                  <span className="text-xs text-primary font-medium">{formatPrice(option.price)}</span>
                </button>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Headlights */}
      <Collapsible open={openSections.headlights} onOpenChange={() => toggleSection("headlights")}>
        <Card variant="glass">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Headlights
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.headlights ? "rotate-180" : ""}`} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2">
              {headlightOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onCustomizationChange({ headlightType: option.value })}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                    customization.headlightType === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-secondary/30 hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm">{option.name}</span>
                  <span className="text-xs text-primary font-medium">{formatPrice(option.price)}</span>
                </button>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Bumpers */}
      <Collapsible open={openSections.bumpers} onOpenChange={() => toggleSection("bumpers")}>
        <Card variant="glass">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Bumpers
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.bumpers ? "rotate-180" : ""}`} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2">
              {bumperOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onCustomizationChange({ bumperType: option.value })}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                    customization.bumperType === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-secondary/30 hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm">{option.name}</span>
                  <span className="text-xs text-primary font-medium">{formatPrice(option.price)}</span>
                </button>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Spoiler */}
      <Collapsible open={openSections.spoiler} onOpenChange={() => toggleSection("spoiler")}>
        <Card variant="glass">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wind className="h-4 w-4 text-primary" />
                Spoiler
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.spoiler ? "rotate-180" : ""}`} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2">
              {spoilerOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onCustomizationChange({ spoilerType: option.value })}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                    customization.spoilerType === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-secondary/30 hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm">{option.name}</span>
                  <span className="text-xs text-primary font-medium">{formatPrice(option.price)}</span>
                </button>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Decals */}
      <Collapsible open={openSections.decals} onOpenChange={() => toggleSection("decals")}>
        <Card variant="glass">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sticker className="h-4 w-4 text-primary" />
                Decals & Stickers
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.decals ? "rotate-180" : ""}`} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2">
              {decalOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onCustomizationChange({ decalType: option.value })}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                    customization.decalType === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-secondary/30 hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm">{option.name}</span>
                  <span className="text-xs text-primary font-medium">{formatPrice(option.price)}</span>
                </button>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
