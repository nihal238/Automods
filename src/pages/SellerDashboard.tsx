import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Plus } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductList from "@/components/seller/ProductList";
import ProductForm from "@/components/seller/ProductForm";

const SellerDashboard = () => {
  const { user, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

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

  if (role !== "seller" && role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-16">
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

  const handleAddNew = () => {
    setEditingProduct(null);
    setActiveTab("add");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your products</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              My Products
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2" onClick={handleAddNew}>
              <Plus className="h-4 w-4" />
              {editingProduct ? "Edit" : "Add New"}
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
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboard;