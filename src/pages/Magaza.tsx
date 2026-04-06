import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Plus, Minus, ArrowDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface StoreProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cover_image_url: string | null;
  features: string[];
  target_audience: string | null;
  badge: string | null;
  display_order: number;
}

const ProductCard = ({
  product,
  index,
}: {
  product: StoreProduct;
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { addItem, removeItem, isInCart } = useCart();
  const inCart = isInCart(product.id);

  const handleToggle = () => {
    toast.info("Çok Yakında! 🚀", {
      description: "Bu ürün henüz satışa sunulmadı. Çok yakında burada olacak!",
    });
  };

  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full"
    >
      <div
        className={`flex flex-col ${
          isEven ? "md:flex-row" : "md:flex-row-reverse"
        } items-center gap-6 md:gap-16 lg:gap-24`}
      >
        {/* Image side */}
        <motion.div
          className="w-full md:w-1/2 relative group"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
            {product.cover_image_url ? (
              <img
                src={product.cover_image_url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                <span className="font-display text-6xl md:text-8xl text-primary/20 select-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Badge floating */}
          {product.badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute -top-3 -right-3 md:top-4 md:right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold tracking-wider shadow-[var(--shadow-orange)]"
            >
              {product.badge}
            </motion.div>
          )}
        </motion.div>

        {/* Content side */}
        <div className="w-full md:w-1/2 space-y-6">
          {/* Number */}
          <span className="font-display text-5xl md:text-7xl lg:text-9xl text-primary/10 leading-none select-none">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="space-y-4 -mt-6 md:-mt-16 relative">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
              {product.name}
            </h2>

            {product.target_audience && (
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md">
                {product.target_audience}
              </p>
            )}

            {/* Features */}
            {product.features.length > 0 && (
              <ul className="space-y-2.5 pt-2">
                {product.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className="flex items-start gap-3"
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            )}

            {/* Price + CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 pt-4">
              <div>
                <span className="font-display text-3xl sm:text-4xl md:text-5xl">
                  {product.price.toLocaleString("tr-TR")}
                </span>
                <span className="text-muted-foreground text-lg ml-1">TL</span>
              </div>

              <Button
                onClick={handleToggle}
                variant="hero"
                size="lg"
                className="group/btn"
              >
                <Plus className="w-4 h-4" />
                Sepete Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Magaza = () => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase as any)
        .from("store_products")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (data) {
        setProducts(
          data.map((p: any) => ({
            ...p,
            features: Array.isArray(p.features) ? p.features : [],
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Full-screen Hero */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity }}
        className="h-screen flex flex-col items-center justify-center relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[150px]" />
        </div>

        <motion.div
          style={{ y: heroY }}
          className="relative text-center px-4 space-y-6"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight"
          >
            Seviyeni
            <br />
            <span className="text-primary">Yükselt.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto"
          >
            Sana uygun programı keşfet.
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Products — one by one, full width */}
      <section className="pb-32">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          {loading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-20 md:space-y-48">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Minimal footer */}
      <section className="pb-16 text-center">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Ana Sayfa
        </Link>
      </section>
    </div>
  );
};

export default Magaza;
