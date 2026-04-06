import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Calendar, Mail, Users, Download, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface OrderDownload {
  name: string;
  path: string;
}

interface OrderBonus {
  title: string;
  path: string;
}

interface OrderData {
  status: "pending" | "paid" | "processing" | "error";
  id?: string;
  customer_name?: string;
  customer_email?: string;
  amount?: number;
  product_name?: string;
  product_title?: string;
  tier?: string;
  downloads?: OrderDownload[];
  bonuses?: OrderBonus[];
  message?: string;
  error?: string;
}

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const oid = searchParams.get("oid");
    const token = searchParams.get("token");

    if (!oid || !token) {
      setOrder({ status: "error", error: "Missing order information" });
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (loading) {
        setOrder({
          status: "processing",
          message: "Ödemeniz işleniyor. Lütfen birkaç saniye bekleyin...",
        });
        setLoading(false);
      }
    }, 12000);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-order?oid=${oid}&token=${token}`, {
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeoutId);
        setOrder(data);
        setLoading(false);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error("Error fetching order:", error);
        setOrder({ status: "error", error: error.message });
        setLoading(false);
      });
  }, []);

  // Meta Pixel Purchase Event
  useEffect(() => {
    if (order?.status === "paid" && order.amount) {
      window.fbq?.("track", "Purchase", {
        value: order.amount,
        currency: "TRY",
        content_name: order.product_name || "Sıçrama360™",
        content_type: "product",
      });
    }
  }, [order]);

  // iOS tespiti
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleDownloadClick = async (path: string, name: string) => {
    // Tık anında boş sekme aç → popup engeline takılmasın (özellikle iOS)
    const preOpened = window.open("about:blank", "_blank");

    try {
      const oid = searchParams.get("oid");
      const token = searchParams.get("token");

      if (!oid || !token) {
        toast({
          title: "Hata",
          description: "İndirme bilgileri bulunamadı",
          variant: "destructive",
        });
        preOpened?.close();
        return;
      }

      const cleanPath = (path || "").trim();

      toast({
        title: "Hazırlanıyor",
        description: "İndirme linki hazırlanıyor...",
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signed-url?oid=${encodeURIComponent(oid)}&token=${encodeURIComponent(token)}&path=${encodeURIComponent(cleanPath)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
          },
        },
      );

      if (!response.ok) {
        let errorMessage = "İndirme linki oluşturulamadı";
        try {
          const err = await response.json();
          errorMessage = err.error || errorMessage;

          if (response.status === 401) errorMessage = "Erişim reddedildi. Lütfen sayfayı yenileyin.";
          else if (response.status === 403) errorMessage = "Ödeme tamamlanmamış olabilir veya erişim süresi dolmuş.";
          else if (response.status === 404) errorMessage = "Dosya bulunamadı. Destek ile iletişime geçin.";
          else if (response.status === 429) errorMessage = "Çok fazla istek. 1 dakika sonra tekrar deneyin.";
        } catch {
          // hata gövdesi yoksa yut
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const signedUrl: string = data?.url || data?.signedUrl || data?.signed_url;
      if (!signedUrl) throw new Error("No download URL received");

      // Güvenli dosya adı + URL'e "download" parametresi ekle
      const safeName = ((name || "program") + (name?.toLowerCase().endsWith(".pdf") ? "" : ".pdf")).replace(
        /[^\w\-.]+/g,
        "_",
      );
      const urlWithName = `${signedUrl}${signedUrl.includes("?") ? "&" : "?"}download=${encodeURIComponent(safeName)}`;

      if (isIOS) {
        // iOS: yeni sekmede açılır; kullanıcı Paylaş ▸ Dosyalara Kaydet ile kaydeder
        if (preOpened) {
          preOpened.location.href = urlWithName;
        } else {
          window.open(urlWithName, "_blank");
        }
        toast({
          title: "PDF açıldı",
          description: "iPhone/iPad: Paylaş ▸ Dosyalara Kaydet ile kaydedebilirsin.",
        });
      } else {
        // Android/PC: otomatik indirme + dosya adı garanti
        const a = document.createElement("a");
        a.href = urlWithName;
        a.setAttribute("download", safeName);
        document.body.appendChild(a);
        a.click();
        a.remove();
        preOpened?.close();

        toast({ title: "Başarılı", description: `${safeName} indiriliyor...` });
      }
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Hata",
        description: error?.message || "İndirme sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
      preOpened?.close();
    }
  };

  const handleResendEmail = async () => {
    if (!order || order.status !== "paid") return;

    setResending(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-order-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!response.ok) {
        let errorMessage = "E-posta gönderilemedi";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;

          if (response.status === 401 || response.status === 403) {
            errorMessage = "Erişim reddedildi. Lütfen sayfayı yenileyin.";
          } else if (response.status === 404) {
            errorMessage = "Sipariş bulunamadı.";
          }
        } catch {}
        throw new Error(errorMessage);
      }

      toast({
        title: "Başarılı",
        description: "E-posta başarıyla gönderildi!",
      });
    } catch (error: any) {
      console.error("Error resending email:", error);
      toast({
        title: "Hata",
        description: "E-posta gönderilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container max-w-3xl">
        <Card className="p-8 md:p-12 bg-card border-primary/50 text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6">
            {loading
              ? "Yükleniyor..."
              : order && order.customer_name
                ? `Hoş Geldin, ${order.customer_name.split(" ")[0]}! 🎉`
                : "Teşekkürler! 🎉"}
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 md:mb-12">
            {order?.status === "paid"
              ? "Sıçrama360™ programına başarıyla kaydoldun!"
              : "Ödemeniz işleniyor. Sipariş detayları için lütfen emailinizi kontrol edin."}
          </p>

          {/* Order Content */}
          {loading ? (
            <Card className="p-6 mb-8 bg-primary/5 border-primary/30">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Sipariş bilgileri yükleniyor...</p>
            </Card>
          ) : order?.status === "processing" ? (
            <Card className="p-6 md:p-8 mb-6 bg-primary/5 border-primary/30">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
              <h2 className="font-display text-2xl mb-3">Ödemeniz İşleniyor</h2>
              <p className="text-muted-foreground">
                {order.message ||
                  "Ödemeniz başarıyla alındı ve işleniyor. Tüm detaylar e-posta adresinize gönderilecek."}
              </p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Sayfayı Yenile
              </Button>
            </Card>
          ) : order?.status === "error" || !order ? (
            <Card className="p-6 md:p-8 mb-6 bg-muted/30 border-border">
              <p className="text-muted-foreground text-center mb-4">
                {order?.error || "Sipariş bilgisi bulunamadı veya erişim linki geçersiz."}
              </p>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Lütfen e-postanızdaki güncel linki kullanın veya bizimle iletişime geçin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "mailto:support@thirteenconcept.com")}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Destek
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                  Ana Sayfaya Dön
                </Button>
              </div>
            </Card>
          ) : order.status === "pending" ? (
            <Card className="p-6 md:p-8 mb-6 bg-primary/5 border-primary/30">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
              <h2 className="font-display text-2xl mb-3">Ödemeniz İşleniyor</h2>
              <p className="text-muted-foreground">
                Ödemeniz başarıyla alındı ve işleniyor. Tüm detaylar e-posta adresinize gönderilecek.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Genellikle birkaç dakika içinde tamamlanır. Lütfen mailinizi kontrol edin.
              </p>
            </Card>
          ) : (
            <>
              {/* Success Message */}
              <Card className="p-6 md:p-8 mb-6 bg-primary/5 border-primary/30">
                <div className="text-center">
                  <h2 className="font-display text-2xl md:text-3xl mb-3">Ödemen Alındı 🎉</h2>
                  <p className="text-muted-foreground mb-4">Sipariş detaylarını e-postana gönderdik.</p>
                  {order.id && (
                    <p className="text-xs text-muted-foreground">
                      Sipariş numarası: {order.id.replace(/-/g, "").slice(0, 12)}...
                    </p>
                  )}
                </div>
              </Card>

              {/* Downloads Section */}
              <Card className="p-6 md:p-8 mb-6 bg-card border-primary/30">
                <div className="flex flex-col items-center">
                  <div className="mb-6">
                    <Download className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-4" />
                    <h2 className="font-display text-2xl md:text-3xl mb-2 text-center">İndirilebilirler</h2>
                    <p className="text-sm text-muted-foreground text-center">
                      Her dosya için 10 dakika geçerli indirme linki oluşturulur
                    </p>
                  </div>

                  <div className="w-full space-y-3">
                    {order.downloads && order.downloads.length > 0 && (
                      <Button
                        onClick={() => handleDownloadClick(order.downloads[0].path, order.downloads[0].name)}
                        size="lg"
                        className="w-full text-sm sm:text-base whitespace-normal h-auto py-3 px-4"
                        aria-label="Ana program PDF dosyasını indir"
                      >
                        <Download className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="text-left break-words">{order.downloads[0].name}</span>
                      </Button>
                    )}

                    {order.bonuses &&
                      order.bonuses.length > 0 &&
                      order.bonuses.map((bonus, index) => (
                        <Button
                          key={index}
                          onClick={() => handleDownloadClick(bonus.path, bonus.title)}
                          size="lg"
                          variant="outline"
                          className="w-full text-sm sm:text-base whitespace-normal h-auto py-3 px-4"
                          aria-label={`${bonus.title} bonusunu indir`}
                        >
                          <Download className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span className="text-left break-words">Bonus: {bonus.title}</span>
                        </Button>
                      ))}

                    {/* Progress Tracker Bonus - only for Elit and VIP */}
                    {order.tier !== 'temel' && (
                      <Button
                        onClick={() => window.open("https://athlevoprogresstracker.lovable.app", "_blank")}
                        size="lg"
                        variant="outline"
                        className="w-full text-sm sm:text-base whitespace-normal h-auto py-3 px-4"
                        aria-label="Athlevo Progress Tracker'a git"
                      >
                        <Calendar className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="text-left break-words">Bonus: Athlevo Progress Tracker</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Email Resend */}
              <Card className="p-4 md:p-6 mb-6 bg-card border-border/50">
                <div className="text-center">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">Tüm indirme linkleri e-postana gönderildi</p>
                  <Button onClick={handleResendEmail} variant="outline" size="sm" disabled={resending}>
                    {resending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        E-postayı Tekrar Gönder
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </>
          )}

          {/* Next Steps - tier-aware */}
          <div className={`grid ${order?.tier === 'temel' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4 md:gap-6 mb-8 md:mb-12 text-left`}>
            {/* Planning call - only for VIP */}
            {order?.tier === 'vip' && (
              <Card className="p-4 md:p-6 bg-dark-surface border-border/50">
                <Calendar className="w-8 h-8 md:w-10 md:h-10 text-primary mb-3 md:mb-4" />
                <h3 className="font-display text-base md:text-lg mb-2">24 Saat İçinde</h3>
                <p className="text-sm md:text-base text-muted-foreground">Planlama görüşmen için link gönderilecek</p>
              </Card>
            )}

            <Card className="p-4 md:p-6 bg-dark-surface border-border/50">
              <Mail className="w-8 h-8 md:w-10 md:h-10 text-primary mb-3 md:mb-4" />
              <h3 className="font-display text-base md:text-lg mb-2">Email Kontrolü</h3>
              <p className="text-sm md:text-base text-muted-foreground">Program detayları mail adresine gönderildi</p>
            </Card>

            {/* Community - only for Elit and VIP */}
            {order?.tier !== 'temel' && (
              <Card className="p-4 md:p-6 bg-dark-surface border-border/50">
                <Users className="w-8 h-8 md:w-10 md:h-10 text-primary mb-3 md:mb-4" />
                <h3 className="font-display text-base md:text-lg mb-2">Topluluk Erişimi</h3>
                <p className="text-sm md:text-base text-muted-foreground">WhatsApp grubu davetiyesi yolda</p>
              </Card>
            )}
          </div>

          {/* Guarantee Reminder */}
          <Card className="p-6 md:p-8 bg-primary/5 border-primary/30 mb-8 md:mb-12">
            <h3 className="font-display text-xl md:text-2xl mb-6 text-center">🎯 Gelişim Garantisi</h3>
            <div className="max-w-2xl mx-auto">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
                <CheckCircle2 className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-base md:text-lg mb-1">%100 Garanti</p>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Programı uygula, antrenmanları yap. Eğer 90 günde sıçramanda gelişim olmazsa, sonuç alana kadar 1:1 ÜCRETSİZ çalışıyorum. Risk benim üzerimde.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {order?.tier !== 'temel' && (
              <Button
                variant="default"
                size="lg"
                onClick={() => window.open("https://chat.whatsapp.com/invite-link", "_blank")}
                className="w-full sm:w-auto"
              >
                <Users className="w-5 h-5 mr-2" />
                WhatsApp Grubuna Katıl
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={() => navigate("/")} className="w-full sm:w-auto">
              Ana Sayfaya Dön
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs md:text-sm text-muted-foreground mt-8 md:mt-12">
            Sorularınız mı var? uzaydemiral@thirteenconcept.com adresinden bize ulaşabilirsiniz.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ThankYou;
