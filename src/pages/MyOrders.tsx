import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Eye, DollarSign, Calendar, Package, Download, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  shipping_address: string | null;
  phone: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  product_id: string | null;
  products?: {
    id: string;
    name: string;
    brand: string;
    category: string;
    image_url: string | null;
    description: string | null;
  } | null;
}

const MyOrders = () => {
  const { user, loading } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  const { data: orderItems } = useQuery({
    queryKey: ["my-order-items", selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder) return [];
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          *,
          products (
            id,
            name,
            brand,
            category,
            image_url,
            description
          )
        `)
        .eq("order_id", selectedOrder.id);

      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!selectedOrder,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const downloadInvoice = (order: Order, items: OrderItem[]) => {
    const invoiceContent = `
=====================================
            INVOICE
=====================================
Order ID: #${order.id.slice(0, 8)}
Date: ${format(new Date(order.created_at), "MMMM d, yyyy")}
Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}

-------------------------------------
SHIPPING INFORMATION
-------------------------------------
Address: ${order.shipping_address || "N/A"}
Phone: ${order.phone || "N/A"}

-------------------------------------
ORDER ITEMS
-------------------------------------
${items.map(item => `
${item.product_name}
  Brand: ${item.products?.brand || "N/A"}
  Category: ${item.products?.category || "N/A"}
  Quantity: ${item.quantity}
  Unit Price: $${(item.price / 100).toFixed(2)}
  Subtotal: $${((item.price * item.quantity) / 100).toFixed(2)}
`).join("\n")}

-------------------------------------
TOTAL: $${(order.total_amount / 100).toFixed(2)}
-------------------------------------

Thank you for your order!
    `.trim();

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-2">Track your order history and status</p>
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : orders?.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center text-muted-foreground text-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(order.created_at), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center text-primary font-medium">
                            <DollarSign className="h-3 w-3" />
                            {(order.total_amount / 100).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
                                  <span>Order Details #{order.id.slice(0, 8)}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => orderItems && downloadInvoice(order, orderItems)}
                                    className="ml-4"
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download Invoice
                                  </Button>
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <span className="text-muted-foreground text-sm">Status:</span>
                                    <Badge className={`${getStatusColor(order.status)} ml-2`}>
                                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground text-sm">Date:</span>
                                    <span className="ml-2 text-foreground">
                                      {format(new Date(order.created_at), "MMMM d, yyyy")}
                                    </span>
                                  </div>
                                </div>

                                <div className="bg-muted/20 rounded-lg p-4">
                                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Shipping Information
                                  </h4>
                                  <p className="text-foreground">
                                    {order.shipping_address || "No address provided"}
                                  </p>
                                  {order.phone && (
                                    <p className="text-muted-foreground text-sm mt-1">
                                      Phone: {order.phone}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                    Order Items ({orderItems?.length || 0})
                                  </h4>
                                  <div className="space-y-3">
                                    {orderItems?.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border/50"
                                      >
                                        <div className="w-20 h-20 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                          {item.products?.image_url ? (
                                            <img
                                              src={item.products.image_url}
                                              alt={item.product_name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-medium text-foreground truncate">
                                            {item.product_name}
                                          </h5>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {item.products?.brand && (
                                              <Badge variant="secondary" className="text-xs">
                                                {item.products.brand}
                                              </Badge>
                                            )}
                                            {item.products?.category && (
                                              <Badge variant="outline" className="text-xs">
                                                {item.products.category}
                                              </Badge>
                                            )}
                                          </div>
                                          {item.products?.description && (
                                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                              {item.products.description}
                                            </p>
                                          )}
                                          <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-muted-foreground">
                                              Qty: {item.quantity} × ${(item.price / 100).toFixed(2)}
                                            </span>
                                            <span className="text-primary font-semibold">
                                              ${((item.price * item.quantity) / 100).toFixed(2)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium">Total Amount</span>
                                    <span className="text-2xl font-bold text-primary">
                                      ${(order.total_amount / 100).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
