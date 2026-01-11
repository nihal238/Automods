import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  RotateCcw, 
  Save, 
  Share2, 
  Sparkles, 
  Eye, 
  Download,
  RotateCw,
  Pause,
  Play,
  ZoomIn,
  ZoomOut,
  Move
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { useCarBrands, useCarModels } from "@/hooks/useCarData";
import { useAuth } from "@/contexts/AuthContext";
import { useCarCustomization } from "@/hooks/useCarCustomization";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CustomizerScene, { type CustomizerSceneRef } from "@/components/customizer/CustomizerScene";
import CustomizationPanel from "@/components/customizer/CustomizationPanel";
import PreviewModal from "@/components/customizer/PreviewModal";
import { QuoteFormDialog } from "@/components/QuoteFormDialog";

const Customize = () => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const sceneRef = useRef<CustomizerSceneRef>(null);

  const { brands, loading: brandsLoading } = useCarBrands();
  const { models, loading: modelsLoading } = useCarModels(selectedBrand || undefined);
  const { user } = useAuth();
  const { 
    customization, 
    updateCustomization, 
    resetCustomization, 
    totalPrice,
    hasModifications 
  } = useCarCustomization();

  const selectedBrandData = brands.find((b) => b.id === selectedBrand);
  const selectedModelData = models.find((m) => m.id === selectedModel);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const captureScreenshot = useCallback(async () => {
    if (sceneRef.current) {
      const url = await sceneRef.current.captureScreenshot();
      setScreenshotUrl(url);
      return url;
    }
    return null;
  }, []);

  const handlePreview = async () => {
    await captureScreenshot();
    setShowPreview(true);
  };

  const handleDownload = async () => {
    let url = screenshotUrl;
    if (!url) {
      url = await captureScreenshot();
    }
    if (url) {
      const link = document.createElement("a");
      link.download = `${selectedBrandData?.name || "Custom"}-${selectedModelData?.name || "Car"}-config.png`;
      link.href = url;
      link.click();
      toast({
        title: "Image Downloaded!",
        description: "Your custom car image has been saved",
      });
    }
  };

  const handleShare = async () => {
    const configText = `Check out my custom ${selectedBrandData?.name || ""} ${selectedModelData?.name || "car"} build on Automods! Total: ${formatPrice(totalPrice)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Custom Car Build - Automods",
          text: configText,
          url: window.location.href,
        });
      } catch {
        await navigator.clipboard.writeText(configText);
        toast({
          title: "Link Copied!",
          description: "Share link has been copied to clipboard",
        });
      }
    } else {
      await navigator.clipboard.writeText(configText);
      toast({
        title: "Link Copied!",
        description: "Share link has been copied to clipboard",
      });
    }
  };

  const handleSaveDesign = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save designs",
        variant: "destructive",
      });
      return;
    }

    if (!selectedModel) {
      toast({
        title: "Select a car",
        description: "Please select a car brand and model first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("saved_designs").insert({
        user_id: user.id,
        car_model_id: selectedModel,
        color: customization.bodyColor,
        modifications: {
          wheelType: customization.wheelType,
          headlightType: customization.headlightType,
          bumperType: customization.bumperType,
          spoilerType: customization.spoilerType,
          decalType: customization.decalType,
        },
        total_cost: totalPrice,
        name: `${selectedBrandData?.name || ""} ${selectedModelData?.name || "Custom"} Build`,
      });

      if (error) throw error;

      toast({
        title: "Design Saved!",
        description: "Your custom design has been saved to your account",
      });
      setShowPreview(false);
    } catch (error) {
      console.error("Error saving design:", error);
      toast({
        title: "Error",
        description: "Failed to save design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetCustomization();
    toast({
      title: "Reset Complete",
      description: "All customizations have been reset to default",
    });
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedModel(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row">
          {/* 3D Viewer */}
          <div className="flex-1 relative bg-gradient-to-b from-background via-secondary/20 to-background">
            <CustomizerScene
              ref={sceneRef}
              customization={customization}
              autoRotate={autoRotate}
            />

            {/* Overlay Controls - Top Left */}
            <div className="absolute top-6 left-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-4 py-3 rounded-xl bg-card/80 backdrop-blur-md border border-border/30"
              >
                <p className="text-xs text-muted-foreground">Currently Building</p>
                <p className="font-display font-bold text-lg">
                  {selectedBrandData && selectedModelData
                    ? `${selectedBrandData.name} ${selectedModelData.name}`
                    : "Select a car to start"}
                </p>
                {hasModifications && (
                  <p className="text-sm text-primary mt-1">
                    +{formatPrice(totalPrice)} in mods
                  </p>
                )}
              </motion.div>
            </div>

            {/* Viewer Controls - Top Right */}
            <div className="absolute top-6 right-6 flex flex-col gap-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-2 p-2 rounded-xl bg-card/80 backdrop-blur-md border border-border/30"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAutoRotate(!autoRotate)}
                  title={autoRotate ? "Stop Rotation" : "Auto Rotate"}
                  className="h-9 w-9"
                >
                  {autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="h-px bg-border/50" />
                <Button variant="ghost" size="icon" title="Zoom In" className="h-9 w-9">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Zoom Out" className="h-9 w-9">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Pan/Move" className="h-9 w-9">
                  <Move className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            {/* Control hints */}
            <div className="absolute bottom-24 left-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xs text-muted-foreground space-y-1"
              >
                <p>🖱️ Drag to rotate</p>
                <p>🔍 Scroll to zoom</p>
                <p>⌨️ Shift+drag to pan</p>
              </motion.div>
            </div>

            {/* Bottom Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3"
            >
              <Button 
                variant="glass" 
                size="sm" 
                className="gap-2"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button 
                variant="glass" 
                size="sm" 
                className="gap-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button 
                variant="glass" 
                size="sm" 
                className="gap-2" 
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button 
                variant="hero" 
                size="sm" 
                className="gap-2"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4" />
                Preview Build
              </Button>
            </motion.div>
          </div>

          {/* Customization Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[380px] xl:w-[420px] border-l border-border/30 bg-card/50 backdrop-blur-xl overflow-y-auto"
          >
            <div className="p-5 space-y-5">
              {/* Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">3D Customizer</h2>
                    <p className="text-xs text-muted-foreground">Real-time preview</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <RotateCw className="h-3 w-3 text-primary animate-spin" style={{ animationDuration: "3s" }} />
                  <span className="text-xs text-primary">Live</span>
                </div>
              </div>

              {/* Customization Options */}
              <CustomizationPanel
                customization={customization}
                onCustomizationChange={updateCustomization}
                selectedBrand={selectedBrand}
                selectedModel={selectedModel}
                onBrandChange={handleBrandChange}
                onModelChange={setSelectedModel}
                brands={brands}
                models={models}
                brandsLoading={brandsLoading}
                modelsLoading={modelsLoading}
              />

              {/* Total & CTA */}
              <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-card via-card to-transparent">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-primary/10 border border-primary/30">
                    <div>
                      <span className="text-xs text-muted-foreground">Estimated Cost</span>
                      <span className="block font-display font-bold text-2xl text-gradient">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    {hasModifications && (
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Modifications</span>
                        <span className="block text-sm font-medium text-primary">
                          {Object.values(customization).filter(v => v !== "standard" && v !== "none" && v !== customization.bodyColor).length} upgrades
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={handleSaveDesign}
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                    <Button 
                      variant="hero" 
                      className="flex-1"
                      onClick={() => setShowQuoteForm(true)}
                    >
                      Get Quote
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        customization={customization}
        totalPrice={totalPrice}
        brandName={selectedBrandData?.name || null}
        modelName={selectedModelData?.name || null}
        screenshotUrl={screenshotUrl}
        onDownload={handleDownload}
        onShare={handleShare}
        onSave={handleSaveDesign}
        isSaving={isSaving}
      />

      {/* Quote Form Dialog */}
      <QuoteFormDialog
        open={showQuoteForm}
        onOpenChange={setShowQuoteForm}
        carBrand={selectedBrandData?.name}
        carModel={selectedModelData?.name}
        customizations={customization}
        estimatedPrice={totalPrice}
        requestType="customizer"
      />
    </div>
  );
};

export default Customize;
