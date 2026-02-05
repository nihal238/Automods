import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  brand: string;
  category: string;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  compatibility: string[];
  rating: number;
  review_count: number;
  is_active: boolean;
}

export function useProducts(category?: string, searchQuery?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        let query = supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (category && category !== "all") {
          query = query.eq("category", category);
        }

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts((data as Product[]) || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchProducts();
  }, [category, searchQuery]);

  return { products, loading };
}
