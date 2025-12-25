import { motion } from "framer-motion";
import { Wrench, Paintbrush, Settings, Shield, Zap, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useServices } from "@/hooks/useServices";

const categoryIcons: Record<string, any> = {
  Exterior: Paintbrush,
  Interior: Headphones,
  Performance: Zap,
  Wheels: Settings,
  Protection: Shield,
  Electronics: Settings,
};

const Services = () => {
  const { services, loading } = useServices();

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof services>);

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-display uppercase tracking-widest mb-6">
              <Wrench className="h-4 w-4" />
              Our Services
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Professional <span className="text-gradient">Modification Services</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From exterior upgrades to performance enhancements, we offer comprehensive
              modification services for your vehicle.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedServices).map(([category, categoryServices], categoryIndex) => {
                const IconComponent = categoryIcons[category] || Wrench;
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="font-display text-2xl font-bold">{category}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryServices.map((service, index) => (
                        <Card
                          key={service.id}
                          variant="glass"
                          className="hover:border-primary/30 transition-all duration-300"
                        >
                          <CardHeader>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <CardDescription>{service.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                Starting from
                              </span>
                              <span className="font-display font-bold text-xl text-primary">
                                {formatPrice(service.base_price)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Card variant="neon" className="max-w-2xl mx-auto">
              <CardContent className="py-8">
                <h3 className="font-display text-2xl font-bold mb-4">
                  Ready to Transform Your Ride?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Get a personalized quote for your car modifications
                </p>
                <Link to="/estimator">
                  <Button variant="hero" size="lg">
                    Get Your Estimate
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
