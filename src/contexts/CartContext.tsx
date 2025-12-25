import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    original_price: number | null;
    image_url: string | null;
    stock: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  totalItems: number;
  totalAmount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            id,
            name,
            brand,
            price,
            original_price,
            image_url,
            stock
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching cart:", error);
        return;
      }

      // Type assertion for the joined data
      const cartItems = (data || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.product,
      })) as CartItem[];

      setItems(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if item already exists in cart
      const existingItem = items.find((item) => item.product_id === productId);

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        });

        if (error) throw error;
      }

      await refreshCart();
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;

      await refreshCart();
    } catch (error: any) {
      console.error("Error updating cart:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update cart",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;

      await refreshCart();
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
    } catch (error: any) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);

      if (error) throw error;

      setItems([]);
    } catch (error: any) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        totalItems,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
