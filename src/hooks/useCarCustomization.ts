import { useState, useMemo, useCallback } from "react";
import type { CarCustomization } from "@/components/customizer/RealisticCustomizerScene";

// Price map for modifications (in INR)
const modificationPrices = {
  wheelType: {
    standard: 0,
    sport: 25000,
    luxury: 45000,
    offroad: 35000,
  },
  headlightType: {
    standard: 0,
    led: 15000,
    xenon: 25000,
    projector: 35000,
  },
  bumperType: {
    standard: 0,
    sport: 20000,
    aggressive: 35000,
    minimal: 15000,
  },
  spoilerType: {
    none: 0,
    lip: 12000,
    wing: 28000,
    gt: 45000,
  },
  decalType: {
    none: 0,
    racing: 8000,
    flames: 12000,
    tribal: 10000,
    geometric: 15000,
  },
  ppfType: {
    none: 0,
    gloss: 85000,
    matte: 95000,
    satin: 90000,
    ceramic: 150000,
  },
};

const defaultCustomization: CarCustomization = {
  bodyColor: "#e63946",
  wheelType: "standard",
  headlightType: "standard",
  bumperType: "standard",
  spoilerType: "none",
  decalType: "none",
  ppfType: "none",
};

export function useCarCustomization() {
  const [customization, setCustomization] = useState<CarCustomization>(defaultCustomization);

  const updateCustomization = useCallback((updates: Partial<CarCustomization>) => {
    setCustomization((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetCustomization = useCallback(() => {
    setCustomization(defaultCustomization);
  }, []);

  const totalPrice = useMemo(() => {
    let total = 0;
    total += modificationPrices.wheelType[customization.wheelType];
    total += modificationPrices.headlightType[customization.headlightType];
    total += modificationPrices.bumperType[customization.bumperType];
    total += modificationPrices.spoilerType[customization.spoilerType];
    total += modificationPrices.decalType[customization.decalType];
    total += modificationPrices.ppfType[customization.ppfType];
    return total;
  }, [customization]);

  const hasModifications = useMemo(() => {
    return (
      customization.wheelType !== "standard" ||
      customization.headlightType !== "standard" ||
      customization.bumperType !== "standard" ||
      customization.spoilerType !== "none" ||
      customization.decalType !== "none" ||
      customization.ppfType !== "none"
    );
  }, [customization]);

  return {
    customization,
    updateCustomization,
    resetCustomization,
    totalPrice,
    hasModifications,
  };
}
