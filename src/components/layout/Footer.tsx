import { Link } from "react-router-dom";
import { Car, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="font-display text-xl font-bold tracking-wider">
                <span className="text-primary">MOD</span>
                <span className="text-foreground">GARAGE</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              India's premier car modification platform. Transform your ride with custom parts, 
              3D visualization, and expert modifications.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {["3D Customize", "Marketplace", "Estimator", "Car Models", "Sellers"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {["Body Kits", "Performance Parts", "Interior Mods", "Paint & Wrap", "Wheels & Tires"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                Mumbai, Maharashtra, India
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                support@modgarage.in
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 ModGarage. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
