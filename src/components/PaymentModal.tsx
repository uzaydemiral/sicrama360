import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Tag } from "lucide-react";
import { z } from "zod";

const paymentSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Ad soyad en az 2 karakter olmalıdır")
    .max(100, "Ad soyad en fazla 100 karakter olabilir")
    .regex(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/, "Ad soyad sadece harf içerebilir"),
  email: z.string()
    .trim()
    .email("Geçerli bir e-posta adresi giriniz")
    .max(255, "E-posta en fazla 255 karakter olabilir"),
  phone: z.string()
    .trim()
    .regex(/^5[0-9]{9}$/, "Telefon numarası 5 ile başlamalı ve 10 haneli olmalıdır"),
});

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productPrice: number;
  tierId?: string;
}

export const PaymentModal = ({
  open,
  onOpenChange,
  productId,
  productName,
  productPrice,
  tierId,
}: PaymentModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [orderOid, setOrderOid] = useState<string | null>(null);
  const [orderAccessToken, setOrderAccessToken] = useState<string | null>(null);
  const [checkingOrder, setCheckingOrder] = useState(false);
  
  // Discount code state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [finalPrice, setFinalPrice] = useState(productPrice);
  
  // Reset state when product price changes or modal opens
  useEffect(() => {
    setFinalPrice(productPrice);
    setAppliedCode(null);
    setCouponInput("");
    setDiscountError("");
  }, [productPrice]);

  // Meta Pixel InitiateCheckout Event
  useEffect(() => {
    if (open) {
      window.fbq?.('track', 'InitiateCheckout', {
        value: productPrice,
        currency: 'TRY',
        content_name: productName,
        content_type: 'product',
      });
    }
  }, [open, productPrice, productName]);

  // Load PayTR iframe resizer script
  useEffect(() => {
    if (paymentToken) {
      const script = document.createElement('script');
      script.src = 'https://www.paytr.com/js/iframeResizer.min.js';
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        if (window.iFrameResize) {
          // @ts-ignore
          window.iFrameResize({}, '#paytriframe');
        }
      };
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [paymentToken]);

  // Listen for payment-success edge function postMessage (iframe breakout)
  useEffect(() => {
    if (!paymentToken) return;

    const handleMessage = (event: MessageEvent) => {
      let parsed: any = null;
      
      // Try to parse JSON string messages from payment-success edge function
      if (typeof event.data === 'string') {
        try {
          parsed = JSON.parse(event.data);
        } catch {
          // Not JSON, check for legacy PayTR patterns
          console.log('[PayTR iframe message]', event.origin, event.data);
          if (event.data.indexOf('status:success') !== -1 || event.data === 'success') {
            console.log('[PayTR] Payment successful via legacy message, redirecting...');
            window.location.href = `${window.location.origin}/tesekkurler`;
            return;
          } else if (event.data.indexOf('status:failed') !== -1 || event.data === 'failed') {
            console.log('[PayTR] Payment failed via legacy message, redirecting...');
            window.location.href = `${window.location.origin}/odeme-hata`;
            return;
          }
          return;
        }
      } else if (typeof event.data === 'object') {
        parsed = event.data;
      }

      if (parsed?.type === 'payment-result') {
        console.log('[PayTR] Payment result received via postMessage:', parsed);
        if (parsed.status === 'success') {
          window.location.href = `${window.location.origin}/tesekkurler?oid=${parsed.oid}&token=${parsed.token}`;
        } else {
          window.location.href = `${window.location.origin}/odeme-hata`;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [paymentToken]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    
    if (!code) {
      setDiscountError("Lütfen bir indirim kodu girin.");
      return;
    }

    setLoading(true);

    try {
      const { data: discount, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (discount) {
        if (discount.expires_at && new Date(discount.expires_at) <= new Date()) {
          setDiscountError("Bu indirim kodu süresi dolmuş.");
          setAppliedCode(null);
          setFinalPrice(productPrice);
          return;
        }

        if (discount.max_uses && discount.current_uses >= discount.max_uses) {
          setDiscountError("Bu indirim kodu kullanım limitine ulaştı.");
          setAppliedCode(null);
          setFinalPrice(productPrice);
          return;
        }

        let discountedPrice: number;
        
        if (discount.type === "percent") {
          discountedPrice = productPrice * (1 - discount.value / 100);
        } else {
          discountedPrice = Math.max(0, productPrice - discount.value);
        }
        
        setFinalPrice(Math.round(discountedPrice * 100) / 100);
        setAppliedCode(code);
        setDiscountError("");
        
        toast({
          title: "İndirim uygulandı!",
          description: `${code} kodu başarıyla uygulandı.`,
        });
      } else {
        setDiscountError("Geçersiz veya süresi dolmuş indirim kodu.");
        setAppliedCode(null);
        setFinalPrice(productPrice);
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      setDiscountError("İndirim kodu doğrulanırken bir hata oluştu.");
      setAppliedCode(null);
      setFinalPrice(productPrice);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validationResult = paymentSchema.safeParse(formData);
      
      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-paytr-payment", {
        body: {
          productId,
          customerName: validationResult.data.name,
          customerEmail: validationResult.data.email,
          customerPhone: validationResult.data.phone,
          redirectUrl: window.location.origin,
          amount: finalPrice,
          couponCode: appliedCode,
          tier: tierId || 'elit',
        },
      });

      if (error) throw error;

      if (data?.success && data?.token) {
        setPaymentToken(data.token);
        setOrderOid(data.orderOid || (data.orderId ? String(data.orderId).replace(/-/g, "") : null));
        setOrderAccessToken(data.accessToken || null);
      } else {
        throw new Error("Payment initialization failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Hata",
        description: "Ödeme başlatılamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOrderStatus = async () => {
    if (!orderOid || !orderAccessToken) {
      toast({
        title: "Bilgi eksik",
        description: "Sipariş doğrulama bilgisi bulunamadı. Lütfen yeniden deneyin.",
        variant: "destructive",
      });
      return;
    }

    setCheckingOrder(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-order?oid=${encodeURIComponent(orderOid)}&token=${encodeURIComponent(orderAccessToken)}`,
        {
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Sipariş kontrol edilemedi");
      }

      if (data?.status === "paid") {
        window.location.href = `${window.location.origin}/tesekkurler?oid=${encodeURIComponent(orderOid)}&token=${encodeURIComponent(orderAccessToken)}`;
        return;
      }

      toast({
        title: "Ödeme bekleniyor",
        description: "Ödeme henüz tamamlanmamış görünüyor. Lütfen birkaç saniye sonra tekrar deneyin.",
      });
    } catch (error) {
      console.error("Order status check error:", error);
      toast({
        title: "Hata",
        description: "Sipariş kontrol edilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setCheckingOrder(false);
    }
  };

  const handleClose = () => {
    setPaymentToken(null);
    setOrderOid(null);
    setOrderAccessToken(null);
    setFormData({ name: "", email: "", phone: "" });
    setErrors({});
    setCouponInput("");
    setAppliedCode(null);
    setDiscountError("");
    setFinalPrice(productPrice);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={paymentToken ? "sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0" : "sm:max-w-md max-h-[85vh] overflow-y-auto"}>
        {paymentToken ? (
          <div className="w-full">
            <div className="p-4 border-b sticky top-0 bg-background z-10">
              <DialogTitle className="text-xl font-display">
                Güvenli Ödeme
              </DialogTitle>
            </div>
            <div className="w-full">
              <iframe 
                src={`https://www.paytr.com/odeme/guvenli/${paymentToken}`}
                id="paytriframe" 
                frameBorder="0" 
                scrolling="yes"
                style={{ width: '100%', minHeight: '600px', border: 'none' }}
              />
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">
                Ödeme Bilgileri
              </DialogTitle>
            </DialogHeader>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">{productName}</p>
              <div className="space-y-2">
                {appliedCode && (
                  <p className="text-sm line-through text-muted-foreground">{productPrice.toLocaleString("tr-TR")} TL</p>
                )}
                <p className="text-3xl font-display text-primary">
                  {finalPrice.toLocaleString("tr-TR")} TL
                </p>
                {appliedCode && (
                  <p className="text-sm text-emerald-600 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Kod: {appliedCode} uygulandı
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4 p-4 bg-muted/50 rounded-lg">
              <Label htmlFor="coupon">İndirim kodu</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setDiscountError("");
                  }}
                  placeholder="İndirim kodun varsa gir"
                  className={discountError ? "border-destructive" : ""}
                  disabled={loading || !!appliedCode}
                />
                <Button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={loading || !!appliedCode || !couponInput.trim()}
                  variant="outline"
                >
                  {appliedCode ? "Uygulandı" : "Kodu Uygula"}
                </Button>
              </div>
              {discountError && (
                <p className="text-xs text-destructive">{discountError}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Adınız Soyadınız"
                  maxLength={100}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@email.com"
                  maxLength={255}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, phone: value });
                  }}
                  placeholder="5XXXXXXXXX"
                  maxLength={10}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  "Ödemeye Geç"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Güvenli ödeme sayfasına yönlendirileceksiniz
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
