import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, ShoppingBag, Eye, IndianRupee, Calendar, ImageIcon, XCircle } from "lucide-react";
import { format } from "date-fns";
import { formatPrice } from "@/lib/currency";

interface Order {
  id: string;
  user_id: string;
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

const orderStatuses = [
  "pending",
  "processing", 
  "confirmed",
  "on_hold",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "failed",
  "refund_pending",
  "refunded",
  "returned",
  "replacement",
];

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["order-items", selectedOrder?.id],
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error("Failed to update order status");
      console.error(error);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "confirmed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "on_hold":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "shipped":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "out_for_delivery":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "delivered":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "failed":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "refund_pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "refunded":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "returned":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      case "replacement":
        return "bg-teal-500/20 text-teal-400 border-teal-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Order Management
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {orderStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
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
              {filteredOrders?.map((order) => (
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
                      <IndianRupee className="h-3 w-3" />
                      {formatPrice(order.total_amount).replace("₹", "")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({ orderId: order.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <Badge className={getStatusColor(order.status)}>
                          {formatStatusLabel(order.status)}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            <Badge className={`${getStatusColor(status)} text-xs`}>
                              {formatStatusLabel(status)}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!["cancelled", "delivered", "failed", "refunded", "returned"].includes(order.status) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this order? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Order</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "cancelled" })}
                              >
                                Cancel Order
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
                          <DialogTitle>Order Details #{order.id.slice(0, 8)}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-muted-foreground text-sm">Status:</span>
                              <Badge className={`${getStatusColor(order.status)} ml-2`}>
                                {formatStatusLabel(order.status)}
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
                                        Qty: {item.quantity} × {formatPrice(item.price)}
                                      </span>
                                      <span className="text-primary font-semibold">
                                        {formatPrice(item.price * item.quantity)}
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
                                {formatPrice(order.total_amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminOrders;