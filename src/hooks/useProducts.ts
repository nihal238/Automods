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
  created_at?: string;
}

export type SortOption = "newest" | "price_asc" | "price_desc" | "rating";

export interface ProductFilters {
  category?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort?: SortOption;
}

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function fetchProducts() {
      try {
        const sort = filters?.sort || "newest";
        let orderCol = "created_at";
        let asc = false;
        if (sort === "price_asc") { orderCol = "price"; asc = true; }
        else if (sort === "price_desc") { orderCol = "price"; asc = false; }
        else if (sort === "rating") { orderCol = "rating"; asc = false; }

        let query = supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order(orderCol, { ascending: asc });

        const category = filters?.category;
        const searchQuery = filters?.searchQuery;
        const minPrice = filters?.minPrice;
        const maxPrice = filters?.maxPrice;

        if (category && category !== "all") {
          query = query.eq("category", category);
        }

        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.trim();
          query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,description.ilike.%${q}%`);
        }

        if (minPrice !== undefined && minPrice > 0) {
          query = query.gte("price", minPrice);
        }

        if (maxPrice !== undefined) {
          query = query.lte("price", maxPrice);
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

    fetchProducts();
  }, [filters?.category, filters?.searchQuery, filters?.minPrice, filters?.maxPrice, filters?.featured, filters?.sort]);

  return { products, loading };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .not("original_price", "is", null)
          .order("created_at", { ascending: false })
          .limit(4);

        if (error) throw error;
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
