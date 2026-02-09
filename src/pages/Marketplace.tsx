import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Star, ShoppingCart, Heart, ChevronDown, Loader2, Package, ArrowUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProducts, useFeaturedProducts, type SortOption } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFavorites, setShowFavorites] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist, wishlistCount } = useWishlist();

  const { products, loading } = useProducts({
    category: selectedCategory,
    searchQuery: searchQuery.trim(),
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
    sort: sortBy,
  });

  const { products: featuredProducts, loading: featuredLoading } = useFeaturedProducts();

  const categories = [
    { id: "all", name: "All Products" },
    { id: "Performance Parts", name: "Performance" },
    { id: "Exterior", name: "Exterior" },
    { id: "Interior", name: "Interior" },
    { id: "Wheels & Tires", name: "Wheels & Tires" },
    { id: "Lighting", name: "Lighting" },
    { id: "Electronics", name: "Electronics" },
    { id: "Exhaust", name: "Exhaust" },
    { id: "Suspension", name: "Suspension" },
    { id: "Accessories", name: "Accessories" },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to add items to cart", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
      toast({ title: "Added to cart!", description: "Product has been added to your cart." });
    } catch {
      toast({ title: "Error", description: "Failed to add product to cart.", variant: "destructive" });
    } finally {
      setAddingToCart(null);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to add favorites", variant: "destructive" });
      navigate("/auth");
      return;
    }
    const added = await toggleWishlist(productId);
    toast({ title: added ? "Added to favorites!" : "Removed from favorites", description: added ? "Product saved to your wishlist." : "Product removed from your wishlist." });
  };

  const displayProducts = showFavorites ? products.filter(p => isInWishlist(p.id)) : products;

  const renderProductCard = (product: any, index: number, isFeatured = false) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <Card variant="glass" className={`group overflow-hidden transition-all duration-300 ${isFeatured ? 'border-primary/30 hover:border-primary/50 relative' : 'hover:border-primary/30'}`}>
        {isFeatured && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold py-1 px-3 z-10 text-center">
            ⭐ FEATURED DEAL
          </div>
        )}
        <div className={`aspect-square bg-gradient-to-br from-secondary to-muted relative overflow-hidden ${isFeatured ? 'pt-6' : ''}`}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}

          {product.original_price && product.original_price > product.price && (
            <div className={`absolute ${isFeatured ? 'top-9' : 'top-3'} left-3 px-2 py-1 rounded bg-destructive text-destructive-foreground text-xs font-display font-bold`}>
              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
            </div>
          )}

          <button
            onClick={() => handleToggleWishlist(product.id)}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
              isInWishlist(product.id)
                ? 'bg-primary text-primary-foreground opacity-100'
                : 'bg-background/80 opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground'
            }`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button variant="hero" size="sm" className="w-full" onClick={() => handleAddToCart(product.id)} disabled={addingToCart === product.id || product.stock === 0}>
              {addingToCart === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : product.stock === 0 ? "Out of Stock" : (<><ShoppingCart className="h-4 w-4 mr-2" />Add to Cart</>)}
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <p className="text-xs text-primary font-display uppercase tracking-wider mb-1">{product.brand}</p>
          <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
          {!isFeatured && (
            <>
              <div className="flex items-center gap-1 mb-2">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-sm font-medium">{product.rating || 0}</span>
                <span className="text-xs text-muted-foreground">({product.review_count || 0})</span>
              </div>
              {product.compatibility && product.compatibility.length > 0 && (
                <p className="text-xs text-muted-foreground mb-3">
                  Fits: {product.compatibility.slice(0, 2).join(", ")}
                  {product.compatibility.length > 2 && ` +${product.compatibility.length - 2}`}
                </p>
              )}
            </>
          )}
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-lg text-primary">{formatPrice(product.price)}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
            )}
          </div>
          {!isFeatured && product.stock < 10 && product.stock > 0 && (
            <p className="text-xs text-destructive mt-2">Only {product.stock} left!</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Parts <span className="text-gradient">Marketplace</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Shop from verified sellers across India. Quality parts with warranty and fast delivery.
            </p>
          </motion.div>

          {/* Search, Sort & Filter Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input type="text" placeholder="Search parts, brands..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              variant={showFavorites ? "default" : "outline"}
              className="gap-2"
              onClick={() => {
                if (!user) { toast({ title: "Please sign in", variant: "destructive" }); navigate("/auth"); return; }
                setShowFavorites(!showFavorites);
              }}
            >
              <Heart className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
              Favorites{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
            </Button>
          </motion.div>

          {/* Price Filter Panel */}
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-4 rounded-lg bg-card border border-border">
              <h3 className="font-medium mb-4">Price Range</h3>
              <div className="space-y-4">
                <Slider value={priceRange} onValueChange={(value) => setPriceRange(value as [number, number])} min={0} max={10000000} step={10000} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPriceRange([0, 10000000])}>Reset Price</Button>
              </div>
            </motion.div>
          )}

          {/* Categories */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {categories.map((category) => (
              <Button key={category.id} variant={selectedCategory === category.id ? "default" : "secondary"} size="sm" onClick={() => setSelectedCategory(category.id)} className="whitespace-nowrap">
                {category.name}
              </Button>
            ))}
          </motion.div>

          {/* Featured Products Section */}
          {!featuredLoading && featuredProducts.length > 0 && selectedCategory === "all" && !searchQuery && !showFavorites && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-12">
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-primary fill-primary" />
                Featured Deals
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product, index) => renderProductCard(product, index, true))}
              </div>
            </motion.div>
          )}

          {/* Section Title */}
          {showFavorites ? (
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary fill-primary" />
              Your Favorites {selectedCategory !== "all" ? `— ${categories.find(c => c.id === selectedCategory)?.name}` : ''}
            </h2>
          ) : selectedCategory === "all" && !searchQuery && featuredProducts.length > 0 && !featuredLoading ? (
            <h2 className="font-display text-2xl font-bold mb-6">All Products</h2>
          ) : null}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty State */}
          {!loading && displayProducts.length === 0 && (
            <div className="text-center py-12">
              {showFavorites ? (
                <>
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground">Click the heart icon on products you love to save them here.</p>
                </>
              ) : (
                <>
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or check back soon!</p>
                </>
              )}
            </div>
          )}

          {/* Products Grid */}
          {!loading && displayProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product, index) => renderProductCard(product, index))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
