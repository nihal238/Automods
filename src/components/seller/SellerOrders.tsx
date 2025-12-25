import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { formatPrice } from "@/lib/currency";

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
  orders: {
    id: string;
    status: string;
    shipping_address: string | null;
    phone: string | null;
    created_at: string;
  };
}

const SellerOrders = () => {
  const { user } = useAuth();

  const { data: orderItems, isLoading } = useQuery({
    queryKey: ["seller-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          *,
          orders!inner (
            id,
            status,
            shipping_address,
            phone,
            created_at
          )
        `)
        .eq("seller_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "shipped":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "delivered":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!orderItems || orderItems.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No orders yet</h3>
          <p className="text-muted-foreground text-center mt-2">
            When customers purchase your products, orders will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group order items by order
  const groupedOrders = orderItems.reduce((acc, item) => {
    const orderId = item.order_id;
    if (!acc[orderId]) {
      acc[orderId] = {
        order: item.orders,
        items: [],
      };
    }
    acc[orderId].items.push(item);
    return acc;
  }, {} as Record<string, { order: OrderItem["orders"]; items: OrderItem[] }>);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Orders for Your Products</h2>
      
      <div className="grid gap-4">
        {Object.entries(groupedOrders).map(([orderId, { order, items }]) => (
          <Card key={orderId} className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Order #{orderId.slice(0, 8)}
                </CardTitle>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(order.created_at), "MMM d, yyyy")}
                </span>
                {order.phone && (
                  <span>Phone: {order.phone}</span>
                )}
              </div>
              {order.shipping_address && (
                <p className="text-sm text-muted-foreground mt-1">
                  Ship to: {order.shipping_address}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        {formatPrice(item.price * item.quantity).replace("₹", "")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SellerOrders;