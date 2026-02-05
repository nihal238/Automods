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

export interface ProductFilters {
  category?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

export function useProducts(filters?: ProductFilters) {
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

        const category = filters?.category;
        const searchQuery = filters?.searchQuery;
        const minPrice = filters?.minPrice;
        const maxPrice = filters?.maxPrice;
        const featured = filters?.featured;

        if (category && category !== "all") {
          query = query.eq("category", category);
        }

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        if (minPrice !== undefined) {
          query = query.gte("price", minPrice);
        }

        if (maxPrice !== undefined) {
          query = query.lte("price", maxPrice);
        }

        // Featured products: has discount (original_price > price) or high rating
        if (featured) {
          query = query.or("original_price.gt.price,rating.gte.4");
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
  }, [filters?.category, filters?.searchQuery, filters?.minPrice, filters?.maxPrice, filters?.featured]);

  return { products, loading };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        // Get products with discounts (original_price > price)
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .not("original_price", "is", null)
          .order("created_at", { ascending: false })
          .limit(4);

        if (error) throw error;
        
        // Filter to only those with actual discounts
        const discounted = (data as Product[] || []).filter(
          p => p.original_price && p.original_price > p.price
        );
        
        setProducts(discounted);
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return { products, loading };
}

export type { Product };
