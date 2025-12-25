import { motion } from "framer-motion";
import { Car, Users, Award, Wrench, Target, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const About = () => {
  const stats = [
    { value: "50+", label: "Car Models", icon: Car },
    { value: "1000+", label: "Parts Available", icon: Wrench },
    { value: "500+", label: "Happy Customers", icon: Users },
    { value: "4.9", label: "Average Rating", icon: Award },
  ];

  const values = [
    {
      icon: Target,
      title: "Quality First",
      description: "We source only the highest quality parts from trusted manufacturers worldwide.",
    },
    {
      icon: Users,
      title: "Customer Focused",
      description: "Your satisfaction is our priority. We provide expert guidance at every step.",
    },
    {
      icon: Heart,
      title: "Passion Driven",
      description: "We're car enthusiasts ourselves, and we understand your love for automobiles.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-gradient">ModGarage</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              India's premier car modification platform. We're passionate about helping car enthusiasts
              transform their vehicles into unique expressions of their personality and style.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {stats.map((stat, index) => (
              <Card key={index} variant="glass" className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="font-display text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-12 items-center mb-16"
          >
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2020, ModGarage was born from a simple idea: make car customization
                  accessible to everyone. We noticed that finding quality parts, reliable sellers,
                  and visualizing modifications was a challenge for most car enthusiasts in India.
                </p>
                <p>
                  Our platform brings together the best sellers, mechanics, and car enthusiasts
                  under one roof. With our 3D visualization technology, you can see exactly how
                  your car will look before making any purchase.
                </p>
                <p>
                  Today, we serve thousands of customers across India, helping them transform
                  their ordinary vehicles into extraordinary machines.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary rounded-2xl flex items-center justify-center">
                <Car className="h-32 w-32 text-primary/30" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-2xl" />
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <Card key={index} variant="glass" className="text-center hover:border-primary/30 transition-all">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-xl mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
