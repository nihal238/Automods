import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CarCustomization } from "./RealisticCustomizerScene";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customization: CarCustomization;
  totalPrice: number;
  brandName: string | null;
  modelName: string | null;
  screenshotUrl: string | null;
  onDownload: () => void;
  onShare: () => void;
  onSave: () => void;
  isSaving: boolean;
}

const modificationLabels: Record<string, Record<string, string>> = {
  wheelType: {
    standard: "Standard Wheels",
    sport: "Sport Alloy Rims",
    luxury: "Luxury Chrome Rims",
    offroad: "Off-Road Wheels",
  },
  headlightType: {
    standard: "Halogen Headlights",
    led: "LED Headlights",
    xenon: "Xenon HID Lights",
    projector: "Projector Headlights",
  },
  bumperType: {
    standard: "Stock Bumpers",
    sport: "Sport Bumpers",
    aggressive: "Aggressive Body Kit",
    minimal: "Minimal Bumpers",
  },
  spoilerType: {
    none: "No Spoiler",
    lip: "Lip Spoiler",
    wing: "Racing Wing",
    gt: "GT Wing",
  },
  decalType: {
    none: "No Decals",
    racing: "Racing Stripes",
    flames: "Flame Graphics",
    tribal: "Tribal Design",
    geometric: "Geometric Pattern",
  },
  ppfType: {
    none: "No PPF",
    gloss: "Gloss PPF",
    matte: "Matte PPF",
    satin: "Satin PPF",
    ceramic: "Ceramic Coating",
  },
};

const colorNames: Record<string, string> = {
  "#e63946": "Racing Red",
  "#0a0a0f": "Midnight Black",
  "#f1f1f1": "Pearl White",
  "#0077b6": "Electric Blue",
  "#f77f00": "Sunset Orange",
  "#2d6a4f": "Emerald Green",
  "#7209b7": "Royal Purple",
  "#495057": "Gunmetal Grey",
  "#d4af37": "Gold Rush",
  "#ff69b4": "Candy Pink",
  "#008b8b": "Ocean Teal",
  "#4a5d23": "Matte Military",
};

export default function PreviewModal({
  isOpen,
  onClose,
  customization,
  totalPrice,
  brandName,
  modelName,
  screenshotUrl,
  onDownload,
  onShare,
  onSave,
  isSaving,
}: PreviewModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const modifications = [
    { label: "Body Color", value: colorNames[customization.bodyColor] || "Custom" },
    { label: "PPF/Coating", value: modificationLabels.ppfType[customization.ppfType] },
    { label: "Wheels", value: modificationLabels.wheelType[customization.wheelType] },
    { label: "Headlights", value: modificationLabels.headlightType[customization.headlightType] },
    { label: "Bumpers", value: modificationLabels.bumperType[customization.bumperType] },
    { label: "Spoiler", value: modificationLabels.spoilerType[customization.spoilerType] },
    { label: "Decals", value: modificationLabels.decalType[customization.decalType] },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card/95 backdrop-blur-xl border-primary/20 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div>
                  <h2 className="font-display font-bold text-xl">Your Custom Build</h2>
                  <p className="text-sm text-muted-foreground">
                    {brandName && modelName ? `${brandName} ${modelName}` : "Custom Configuration"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Preview Image */}
              <div className="relative aspect-video bg-gradient-to-b from-secondary to-background">
                {screenshotUrl ? (
                  <img
                    src={screenshotUrl}
                    alt="Custom car preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Modifications List */}
              <div className="p-4 space-y-4">
                <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Configuration Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {modifications.map((mod) => (
                    <div
                      key={mod.label}
                      className="p-3 rounded-lg bg-secondary/50 border border-border/30"
                    >
                      <p className="text-xs text-muted-foreground">{mod.label}</p>
                      <p className="text-sm font-medium">{mod.value}</p>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Total</p>
                    <p className="font-display font-bold text-2xl text-gradient">
                      {formatPrice(totalPrice)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onDownload} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Continue Editing
                  </Button>
                  <Button 
                    variant="hero" 
                    className="flex-1 gap-2" 
                    onClick={onSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save Configuration
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
