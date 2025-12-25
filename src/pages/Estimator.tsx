import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Calculator, Car, Wrench, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCarBrands, useCarModels } from "@/hooks/useCarData";
import { useServices } from "@/hooks/useServices";
import { toast } from "@/hooks/use-toast";

const Estimator = () => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const { brands, loading: brandsLoading } = useCarBrands();
  const { models, loading: modelsLoading } = useCarModels(selectedBrand || undefined);
  const { services, loading: servicesLoading } = useServices();

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const totalCost = selectedServices.reduce((acc, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return acc + (service?.base_price || 0);
  }, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleGetQuote = () => {
    if (!selectedModel || selectedServices.length === 0) {
      toast({
        title: "Incomplete Selection",
        description: "Please select a car and at least one service",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Quote Requested!",
      description: `We'll contact you soon with a detailed quote for ${formatPrice(totalCost)}`,
    });
  };

  const selectedBrandData = brands.find((b) => b.id === selectedBrand);
  const selectedModelData = models.find((m) => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-display uppercase tracking-widest mb-6">
              <Calculator className="h-4 w-4" />
              Modification Estimator
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Get Your <span className="text-gradient">Mod Estimate</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select your car and choose modifications to get an instant price estimate.
              All prices include parts and professional installation.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Selection */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1: Select Brand */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-display font-bold text-sm">
                        1
                      </div>
                      <div>
                        <CardTitle className="text-lg">Select Brand</CardTitle>
                        <CardDescription>Choose your car manufacturer</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {brandsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {brands.map((brand) => (
                          <button
                            key={brand.id}
                            onClick={() => {
                              setSelectedBrand(brand.id);
                              setSelectedModel(null);
                            }}
                            className={`p-4 rounded-lg border transition-all duration-300 ${
                              selectedBrand === brand.id
                                ? "border-primary bg-primary/10 shadow-neon"
                                : "border-border/50 bg-secondary/30 hover:border-primary/30"
                            }`}
                          >
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2 font-display font-bold text-lg text-primary">
                              {brand.logo_code}
                            </div>
                            <p className="text-sm font-medium text-center">{brand.name}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Step 2: Select Model */}
              {selectedBrand && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="glass">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-display font-bold text-sm">
                          2
                        </div>
                        <div>
                          <CardTitle className="text-lg">Select Model</CardTitle>
                          <CardDescription>Choose your {selectedBrandData?.name} model</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {modelsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : models.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No models found</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {models.map((model) => (
                            <button
                              key={model.id}
                              onClick={() => setSelectedModel(model.id)}
                              className={`p-4 rounded-lg border transition-all duration-300 overflow-hidden ${
                                selectedModel === model.id
                                  ? "border-primary bg-primary/10 shadow-neon"
                                  : "border-border/50 bg-secondary/30 hover:border-primary/30"
                              }`}
                            >
                              {model.image_url ? (
                                <div className="w-full h-16 rounded-lg overflow-hidden mb-2">
                                  <img
                                    src={model.image_url}
                                    alt={model.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement!.innerHTML = '<div class="h-full flex items-center justify-center"><svg class="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0m10 0m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0m-9-2h10V8l3 3H3v4l2 2z"/></svg></div>';
                                    }}
                                  />
                                </div>
                              ) : (
                                <Car className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              )}
                              <p className="text-sm font-medium text-center">{model.name}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Select Services */}
              {selectedModel && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="glass">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-display font-bold text-sm">
                          3
                        </div>
                        <div>
                          <CardTitle className="text-lg">Select Services</CardTitle>
                          <CardDescription>Choose the modifications you want</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {servicesLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {services.map((service) => (
                            <button
                              key={service.id}
                              onClick={() => toggleService(service.id)}
                              className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                                selectedServices.includes(service.id)
                                  ? "border-primary bg-primary/10"
                                  : "border-border/50 bg-secondary/30 hover:border-primary/30"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    selectedServices.includes(service.id)
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground"
                                  }`}
                                >
                                  {selectedServices.includes(service.id) && (
                                    <ChevronRight className="h-3 w-3 text-primary-foreground" />
                                  )}
                                </div>
                                <div className="text-left">
                                  <p className="font-medium">{service.name}</p>
                                  <p className="text-xs text-muted-foreground">{service.category}</p>
                                </div>
                              </div>
                              <span className="font-display font-bold text-primary">
                                {formatPrice(service.base_price)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card variant="neon">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IndianRupee className="h-5 w-5 text-primary" />
                        Estimate Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Selected Car */}
                      <div className="p-3 rounded-lg bg-secondary/50 border border-border/30">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Selected Vehicle
                        </p>
                        <p className="font-display font-bold">
                          {selectedBrandData && selectedModelData
                            ? `${selectedBrandData.name} ${selectedModelData.name}`
                            : "No vehicle selected"}
                        </p>
                      </div>

                      {/* Selected Services */}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                          Selected Modifications ({selectedServices.length})
                        </p>
                        {selectedServices.length > 0 ? (
                          <div className="space-y-2">
                            {selectedServices.map((serviceId) => {
                              const service = services.find((s) => s.id === serviceId);
                              return (
                                <div
                                  key={serviceId}
                                  className="flex justify-between items-center text-sm"
                                >
                                  <span className="text-muted-foreground">{service?.name}</span>
                                  <span>{formatPrice(service?.base_price || 0)}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No services selected</p>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-border/50" />

                      {/* Total */}
                      <div className="flex justify-between items-center">
                        <span className="font-display font-bold text-lg">Total Estimate</span>
                        <span className="font-display font-bold text-2xl text-gradient">
                          {formatPrice(totalCost)}
                        </span>
                      </div>

                      {/* CTA */}
                      <Button
                        variant="hero"
                        className="w-full"
                        disabled={selectedServices.length === 0}
                        onClick={handleGetQuote}
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Get Detailed Quote
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        * Prices are estimates and may vary based on specific requirements
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Estimator;
