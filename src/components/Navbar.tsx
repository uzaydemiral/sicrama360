import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Menu, X } from "lucide-react";
import CartDrawer from "@/components/CartDrawer";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display text-xl md:text-2xl tracking-tight">
              <span className="text-primary">Sıçrama</span>
              <span className="text-foreground">360</span>
              <span className="text-primary">™</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ana Sayfa
            </Link>
            <Link to="/magaza">
              <Button variant="outline" size="sm" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Mağaza
              </Button>
            </Link>
            <CartDrawer />
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menü"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border/30 pt-4 space-y-3 animate-in slide-in-from-top-2">
            <Link
              to="/"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Ana Sayfa
            </Link>
            <Link to="/magaza">
              <Button variant="outline" size="sm" className="gap-2 w-full">
                <ShoppingBag className="w-4 h-4" />
                Mağaza
              </Button>
            </Link>
            <div className="flex justify-center">
              <CartDrawer />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
