import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Star, ShoppingCart, Heart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Products" },
    { id: "bodykits", name: "Body Kits" },
    { id: "wheels", name: "Wheels & Tires" },
    { id: "exhaust", name: "Exhaust Systems" },
    { id: "interior", name: "Interior" },
    { id: "lighting", name: "Lighting" },
    { id: "performance", name: "Performance" },
  ];

  const products = [
    {
      id: 1,
      name: "Aggressive Front Bumper Kit",
      brand: "AutoStyle Pro",
      price: 32000,
      originalPrice: 38000,
      rating: 4.8,
      reviews: 124,
      image: "FK",
      category: "bodykits",
      compatibility: ["Swift", "Baleno", "i20"],
      seller: "SpeedWorks Mumbai",
    },
    {
      id: 2,
      name: "17\" Alloy Wheels Set",
      brand: "Enkei",
      price: 48000,
      originalPrice: 52000,
      rating: 4.9,
      reviews: 89,
      image: "AW",
      category: "wheels",
      compatibility: ["Multiple Models"],
      seller: "WheelHub Delhi",
    },
    {
      id: 3,
      name: "Sport Exhaust System",
      brand: "Borla",
      price: 28000,
      originalPrice: null,
      rating: 4.7,
      reviews: 56,
      image: "EX",
      category: "exhaust",
      compatibility: ["City", "Verna", "Civic"],
      seller: "Performance Plus",
    },
    {
      id: 4,
      name: "LED DRL Headlight Set",
      brand: "Philips Racing",
      price: 18500,
      originalPrice: 22000,
      rating: 4.6,
      reviews: 203,
      image: "HL",
      category: "lighting",
      compatibility: ["Nexon", "Creta", "Brezza"],
      seller: "LightPro Chennai",
    },
    {
      id: 5,
      name: "Premium Leather Seat Covers",
      brand: "Elegance Auto",
      price: 15000,
      originalPrice: 18000,
      rating: 4.5,
      reviews: 167,
      image: "SC",
      category: "interior",
      compatibility: ["Universal Fit"],
      seller: "Interior Masters",
    },
    {
      id: 6,
      name: "Cold Air Intake System",
      brand: "K&N Performance",
      price: 12500,
      originalPrice: null,
      rating: 4.8,
      reviews: 78,
      image: "AI",
      category: "performance",
      compatibility: ["Swift", "Polo", "i20"],
      seller: "TurboZone Pune",
    },
    {
      id: 7,
      name: "Wide Body Fender Kit",
      brand: "Liberty Walk Style",
      price: 85000,
      originalPrice: 95000,
      rating: 4.9,
      reviews: 34,
      image: "WB",
      category: "bodykits",
      compatibility: ["Thar", "Fortuner"],
      seller: "Elite Mods Bangalore",
    },
    {
      id: 8,
      name: "Sport Suspension Coilovers",
      brand: "Tein",
      price: 45000,
      originalPrice: null,
      rating: 4.7,
      reviews: 92,
      image: "SP",
      category: "performance",
      compatibility: ["Swift", "City", "Verna"],
      seller: "Suspension Pro",
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Parts <span className="text-gradient">Marketplace</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Shop from verified sellers across India. Quality parts with warranty and fast delivery.
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search parts, brands, or sellers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="secondary" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide"
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card variant="glass" className="group overflow-hidden hover:border-primary/30 transition-all duration-300">
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl font-display font-bold text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300">
                        {product.image}
                      </span>
                    </div>
                    
                    {/* Discount Badge */}
                    {product.originalPrice && (
                      <div className="absolute top-3 left-3 px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-display font-bold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground">
                      <Heart className="h-4 w-4" />
                    </button>

                    {/* Quick Add */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Button variant="hero" size="sm" className="w-full">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* Brand */}
                    <p className="text-xs text-primary font-display uppercase tracking-wider mb-1">
                      {product.brand}
                    </p>

                    {/* Name */}
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>

                    {/* Compatibility */}
                    <p className="text-xs text-muted-foreground mb-3">
                      Fits: {product.compatibility.slice(0, 2).join(", ")}
                      {product.compatibility.length > 2 && ` +${product.compatibility.length - 2}`}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-bold text-lg text-primary">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Seller */}
                    <p className="text-xs text-muted-foreground mt-2">
                      Sold by: {product.seller}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Marketplace;
