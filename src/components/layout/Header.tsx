import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Car, User, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navLinks = [{
    href: "/",
    label: "Home"
  }, {
    href: "/customize",
    label: "3D Customize"
  }, {
    href: "/marketplace",
    label: "Marketplace"
  }, {
    href: "/estimator",
    label: "Estimator"
  }];
  const isActive = (path: string) => location.pathname === path;
  return <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Car className="h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-display text-xl font-bold tracking-wider">
              <span className="text-primary">AUTO</span>
              <span className="text-foreground">MOD</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => <Link key={link.href} to={link.href}>
                <Button variant="ghost" className={`relative ${isActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {link.label}
                  {isActive(link.href) && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" transition={{
                type: "spring",
                bounce: 0.2,
                duration: 0.6
              }} />}
                </Button>
              </Link>)}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Link to="/auth">
              <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && <motion.nav initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: "auto"
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden py-4 border-t border-border/30">
            <div className="flex flex-col gap-2">
              {navLinks.map(link => <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className={`w-full justify-start ${isActive(link.href) ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                    {link.label}
                  </Button>
                </Link>)}
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full mt-2">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.nav>}
      </div>
    </header>;
};
export default Header;