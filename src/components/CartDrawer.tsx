import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { PaymentModal } from "@/components/PaymentModal";



const CartDrawer = () => {
  const { items, removeItem, clearCart, total, count } = useCart();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleCheckout = () => {
    setSheetOpen(false);
    setPaymentOpen(true);
  };

  // For now, combine cart items into a single payment
  const cartSummaryName = items.map((i) => i.name).join(" + ");

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button className="relative p-2 text-foreground hover:text-primary transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent className="bg-card border-border w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-display text-xl">Sepetim ({count})</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Sepetiniz boş</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 mt-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    {item.cover_image_url ? (
                      <img
                        src={item.cover_image_url}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-primary font-display text-sm">
                        {item.price.toLocaleString("tr-TR")} TL
                      </p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Toplam</span>
                  <span className="font-display text-2xl text-primary">
                    {total.toLocaleString("tr-TR")} TL
                  </span>
                </div>
                <Button onClick={handleCheckout} variant="hero" size="xl" className="w-full">
                  Ödemeye Geç
                </Button>
                <Button onClick={clearCart} variant="ghost" size="sm" className="w-full text-muted-foreground">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Sepeti Temizle
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {items.length > 0 && (
        <PaymentModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          productId={items[0].id}
          productName={cartSummaryName}
          productPrice={total}
          tierId="magaza"
        />
      )}
    </>
  );
};

export default CartDrawer;
