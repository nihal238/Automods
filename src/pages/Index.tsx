import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Wrench, Palette, ShoppingBag, Gauge, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import heroCar from "@/assets/hero-car.jpg";

const Index = () => {
  const features = [
    {
      icon: Palette,
      title: "3D Customize",
      description: "Visualize modifications on your car in real-time 3D",
    },
    {
      icon: Gauge,
      title: "Price Estimator",
      description: "Get instant quotes for your dream modifications",
    },
    {
      icon: ShoppingBag,
      title: "Parts Marketplace",
      description: "Shop from verified sellers across India",
    },
    {
      icon: Wrench,
      title: "Expert Mods",
      description: "Professional installation services available",
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "All products verified for quality and fitment",
    },
    {
      icon: Truck,
      title: "Pan-India Delivery",
      description: "Fast shipping to every corner of India",
    },
  ];

  const popularCars = [
    {
      name: "Maruti Swift",
      brand: "Maruti Suzuki",
      mods: 245,
      image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&q=80",
    },
    {
      name: "Hyundai i20",
      brand: "Hyundai",
      mods: 189,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80",
    },
    {
      name: "Tata Nexon",
      brand: "Tata",
      mods: 167,
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80",
    },
    {
      name: "Honda City",
      brand: "Honda",
      mods: 201,
      image: "https://images.unsplash.com/?Honda city,blacke,w=600&q=80",
    },
    {
      name: "Mahindra Thar",
      brand: "Mahindra",
      mods: 312,
      image: "https://unsplash.com/photos/a-black-jeep-parked-on-a-dirt-road-kszV_-3Ka1k",
    },
    {
      name: "VW Polo",
      brand: "Volkswagen",
      mods: 156,
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img src={heroCar} alt="Modified sports car" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Speed Lines Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent w-full speed-lines"
              style={{
                top: `${20 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-display uppercase tracking-widest mb-6">
                India's #1 Mod Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-foreground">Transform Your</span>
              <br />
              <span className="text-gradient">Dream Ride</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl"
            >
              Customize, visualize, and purchase modifications for your car. From body kits to performance parts – bring
              your vision to life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/customize">
                <Button variant="hero" size="xl" className="group w-full sm:w-auto">
                  Start Customizing
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/estimator">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Get Estimate
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap gap-6 sm:gap-8 mt-12 pt-8 border-t border-border/30"
            >
              {[
                { value: "50+", label: "Car Models" },
                { value: "1000+", label: "Parts Available" },
                { value: "500+", label: "Happy Customers" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From visualization to purchase – we've got your entire modification journey covered
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="glass" className="h-full hover:border-primary/30 transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cars Section */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Popular Indian Cars</h2>
              <p className="text-muted-foreground">Most customized vehicles on our platform</p>
            </div>
            <Button variant="outline">
              View All Cars
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCars.map((car, index) => (
              <motion.div
                key={car.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  variant="elevated"
                  className="group cursor-pointer hover:border-primary/30 transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-video bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm text-primary text-xs font-display">
                        {car.mods} mods
                      </span>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{car.brand}</p>
                    <h3 className="font-display font-bold text-lg group-hover:text-primary transition-colors">
                      {car.name}
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-gradient">Modify</span> Your Ride?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of car enthusiasts who have transformed their vehicles with Automods. Start your
              customization journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="xl">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="glass" size="xl">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
