import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CarBrand {
  id: string;
  name: string;
  logo_code: string;
}

interface CarModel {
  id: string;
  brand_id: string;
  name: string;
  image_url: string | null;
  model_3d_url: string | null;
  year_start: number | null;
  year_end: number | null;
}

export function useCarBrands() {
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const { data, error } = await supabase
          .from("car_brands")
          .select("*")
          .order("name");

        if (error) throw error;
        setBrands(data || []);
      } catch (error) {
        console.error("Error fetching car brands:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBrands();
  }, []);

  return { brands, loading };
}

export function useCarModels(brandId?: string) {
  const [models, setModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      try {
        let query = supabase.from("car_models").select("*").order("name");

        if (brandId) {
          query = query.eq("brand_id", brandId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setModels(data || []);
      } catch (error) {
        console.error("Error fetching car models:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, [brandId]);

  return { models, loading };
}

export function useCarData() {
  const { brands, loading: brandsLoading } = useCarBrands();
  const { models, loading: modelsLoading } = useCarModels();

  return {
    brands,
    models,
    loading: brandsLoading || modelsLoading,
  };
}
