import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

const SellerStats = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["seller-stats", user?.id],
    queryFn: async () => {
      // Get products count and stock
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, stock, price")
        .eq("seller_id", user!.id);

      if (productsError) throw productsError;

      // Get order items for this seller
      const { data: orderItems, error: orderItemsError } = await supabase
        .from("order_items")
        .select("quantity, price")
        .eq("seller_id", user!.id);

      if (orderItemsError) throw orderItemsError;

      const totalProducts = products?.length || 0;
      const totalStock = products?.reduce((acc, p) => acc + p.stock, 0) || 0;
      const inventoryValue = products?.reduce((acc, p) => acc + p.price * p.stock, 0) || 0;
      const totalSales = orderItems?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
      const totalOrders = orderItems?.length || 0;

      return {
        totalProducts,
        totalStock,
        inventoryValue,
        totalSales,
        totalOrders,
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Total Stock",
      value: stats?.totalStock || 0,
      icon: ShoppingCart,
      color: "text-green-500",
    },
    {
      title: "Inventory Value",
      value: `$${((stats?.inventoryValue || 0) / 100).toFixed(2)}`,
      icon: DollarSign,
      color: "text-yellow-500",
    },
    {
      title: "Total Sales",
      value: `$${((stats?.totalSales || 0) / 100).toFixed(2)}`,
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SellerStats;
