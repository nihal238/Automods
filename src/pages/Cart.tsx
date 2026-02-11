import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import DummyPaymentModal from "@/components/DummyPaymentModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import { formatPrice } from "@/lib/currency";

const Cart = () => {
  const { items, loading, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const validateFields = () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to checkout", variant: "destructive" });
      navigate("/auth");
      return false;
    }
    if (!fullName.trim()) {
      toast({ title: "Name required", description: "Please enter your full name", variant: "destructive" });
      return false;
    }
    if (!phone.trim() || phone.length < 10) {
      toast({ title: "Valid phone number required", description: "Please enter a valid 10-digit mobile number", variant: "destructive" });
      return false;
    }
    if (!address.trim()) {
      toast({ title: "Address required", description: "Please enter your complete shipping address", variant: "destructive" });
      return false;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      toast({ title: "Valid pincode required", description: "Please enter a valid 6-digit pincode", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleCheckout = () => {
    if (!validateFields()) return;
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setCheckoutLoading(true);

    const shippingAddr = `${fullName}\n${address}\nPincode: ${pincode}`;
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          total_amount: totalAmount,
          shipping_address: shippingAddr,
          phone: phone,
          status: "paid",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        seller_id: null, // Will be updated via trigger or separate query
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      toast({
        title: "Order Placed!",
        description: `Your order #${order.id.slice(0, 8)} has been placed successfully.`,
      });

      navigate("/");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Card variant="glass" className="max-w-md mx-auto text-center py-12">
              <CardContent>
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold mb-2">Sign in to view cart</h2>
                <p className="text-muted-foreground mb-6">
                  Please sign in to view and manage your cart
                </p>
                <Link to="/auth">
                  <Button variant="hero">Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Shopping <span className="text-gradient">Cart</span>
            </h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added any items yet
                </p>
                <Link to="/marketplace">
                  <Button variant="hero">Browse Marketplace</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card variant="glass">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-secondary to-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.product.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-2xl font-display font-bold text-muted-foreground/30">
                                {item.product.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <p className="text-xs text-primary font-display uppercase tracking-wider">
                              {item.product.brand}
                            </p>
                            <h3 className="font-medium mb-2">{item.product.name}</h3>

                            <div className="flex flex-wrap items-center justify-between gap-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Stock info */}
                              {item.quantity >= item.product.stock && (
                                <span className="text-xs text-muted-foreground">Max qty</span>
                              )}

                              {/* Price & Remove */}
                              <div className="flex items-center gap-4">
                                <span className="font-display font-bold text-primary">
                                  {formatPrice(item.product.price * item.quantity)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => removeFromCart(item.product_id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card variant="neon" className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name *</label>
                      <Input
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Mobile Number *</label>
                      <Input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Shipping Address *</label>
                      <Input
                        placeholder="Enter your full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Pincode *</label>
                      <Input
                        placeholder="6-digit pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                    </div>

                    <div className="border-t border-border/50 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-green-500">Free</span>
                      </div>
                    </div>

                    <div className="border-t border-border/50 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-display font-bold text-lg">Total</span>
                        <span className="font-display font-bold text-2xl text-gradient">
                          {formatPrice(totalAmount)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="hero"
                      className="w-full"
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                    >
                      {checkoutLoading ? (
                        "Processing..."
                      ) : (
                        <>
                          Checkout
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <Link to="/marketplace" className="block">
                      <Button variant="ghost" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <DummyPaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        amount={totalAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Cart;
