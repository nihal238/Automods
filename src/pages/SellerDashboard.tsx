import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Plus, BarChart3, ShoppingBag } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductList from "@/components/seller/ProductList";
import ProductForm from "@/components/seller/ProductForm";
import SellerStats from "@/components/seller/SellerStats";
import SellerOrders from "@/components/seller/SellerOrders";

const SellerDashboard = () => {
  const { user, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== "seller" && role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You need a seller account to access this page.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleEditProduct = (productId: string) => {
    setEditingProduct(productId);
    setActiveTab("add");
  };

  const handleFormComplete = () => {
    setEditingProduct(null);
    setActiveTab("products");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your products and track sales</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {editingProduct ? "Edit" : "Add"}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductList onEdit={handleEditProduct} />
          </TabsContent>

          <TabsContent value="add">
            <ProductForm 
              productId={editingProduct} 
              onComplete={handleFormComplete}
            />
          </TabsContent>

          <TabsContent value="orders">
            <SellerOrders />
          </TabsContent>

          <TabsContent value="stats">
            <SellerStats />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboard;
