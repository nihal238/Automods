import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingBag, IndianRupee, Wrench, Car } from "lucide-react";
import { formatPrice } from "@/lib/currency";

const AdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersRes, productsRes, ordersRes, servicesRes, carsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id, price, stock", { count: "exact" }),
        supabase.from("orders").select("id, total_amount, status", { count: "exact" }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("car_models").select("id", { count: "exact", head: true }),
      ]);

      const totalUsers = usersRes.count || 0;
      const totalProducts = productsRes.count || 0;
      const totalOrders = ordersRes.count || 0;
      const totalServices = servicesRes.count || 0;
      const totalCars = carsRes.count || 0;

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const pendingOrders = ordersRes.data?.filter(o => o.status === "pending").length || 0;

      return {
        totalUsers,
        totalProducts,
        totalOrders,
        totalServices,
        totalCars,
        totalRevenue,
        pendingOrders,
      };
    },
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
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-green-400",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "text-purple-400",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: ShoppingBag,
      color: "text-yellow-400",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: IndianRupee,
      color: "text-primary",
    },
    {
      title: "Services",
      value: stats?.totalServices || 0,
      icon: Wrench,
      color: "text-orange-400",
    },
    {
      title: "Car Models",
      value: stats?.totalCars || 0,
      icon: Car,
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="bg-card/50 border-border/50">
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

export default AdminStats;