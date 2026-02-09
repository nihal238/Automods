import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";
import AutoModsLogo from "@/components/AutoModsLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().trim().min(1, "Name is required").optional(),
});

type AuthView = "login" | "signup" | "forgot-password";

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"customer" | "seller">("customer");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a password reset link.",
          });
          setView("login");
        }
        return;
      }

      // Validate form data
      const validationData = view === "login"
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };

      authSchema.parse(validationData);

      if (view === "login") {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          let message = error.message;
          if (message.includes("Invalid login credentials")) {
            message = "Invalid email or password. Please try again.";
          }
          toast({
            title: "Login Failed",
            description: message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      } else {
        if (!formData.name.trim()) {
          toast({
            title: "Name Required",
            description: "Please enter your name.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.name, role);

        if (error) {
          let message = error.message;
          if (message.includes("User already registered")) {
            message = "An account with this email already exists. Please sign in instead.";
          }
          toast({
            title: "Sign Up Failed",
            description: message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Account Created!",
          description: "Welcome to Automods!",
        });
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (view === "forgot-password") {
      return (
        <>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => setView("login")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-6 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>
          </CardContent>
        </>
      );
    }

    return (
      <>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">
            {view === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {view === "login"
              ? "Sign in to continue your journey"
              : "Join the Automods community"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Role Selector (Sign Up Only) */}
          {view === "signup" && (
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={role === "customer" ? "default" : "secondary"}
                className="flex-1"
                onClick={() => setRole("customer")}
              >
                Customer
              </Button>
              <Button
                type="button"
                variant={role === "seller" ? "default" : "secondary"}
                className="flex-1"
                onClick={() => setRole("seller")}
              >
                Seller
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {view === "login" && (
              <button
                type="button"
                onClick={() => setView("forgot-password")}
                className="text-sm text-primary hover:underline block w-full text-right"
              >
                Forgot password?
              </button>
            )}

            <Button type="submit" variant="hero" className="w-full group" disabled={loading}>
              {loading ? (
                "Please wait..."
              ) : (
                <>
                  {view === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {view === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setView(view === "login" ? "signup" : "login")}
              className="text-primary hover:underline font-medium"
            >
              {view === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </CardContent>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 carbon-texture opacity-30" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <Car className="h-10 w-10 text-primary" />
            <span className="font-display text-2xl font-bold tracking-wider">
              <span className="text-primary">AUTO</span>
              <span className="text-foreground">MODS</span>
            </span>
          </Link>

          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl xl:text-5xl font-bold leading-tight mb-6"
          >
            Transform Your
            <br />
            <span className="text-gradient">Driving Experience</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-md mb-8"
          >
            Join India's largest community of car enthusiasts. Customize, visualize, 
            and bring your dream ride to life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex gap-8"
          >
            {[
              { value: "50+", label: "Car Models" },
              { value: "1K+", label: "Parts" },
              { value: "500+", label: "Users" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <Car className="h-8 w-8 text-primary" />
            <span className="font-display text-xl font-bold tracking-wider">
              <span className="text-primary">AUTO</span>
              <span className="text-foreground">MODS</span>
            </span>
          </Link>

          <Card variant="glass" className="border-border/30">
            {renderForm()}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;