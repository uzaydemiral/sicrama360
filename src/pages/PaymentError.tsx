import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "Bilinmeyen bir hata oluştu";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        <Card className="p-8 md:p-12 bg-card border-destructive/50 text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 md:w-24 md:h-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-12 h-12 md:w-16 md:h-16 text-destructive" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="font-display text-3xl md:text-5xl mb-4 md:mb-6">Ödeme Tamamlanamadı</h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-4">Ödemeniz işlenirken bir sorun oluştu.</p>

          {/* Error Details */}
          <Card className="p-4 md:p-6 mb-8 bg-destructive/5 border-destructive/30">
            <p className="text-sm md:text-base text-muted-foreground">
              <span className="font-semibold">Hata Nedeni:</span>
              <br />
              {reason}
            </p>
          </Card>

          {/* Help Text */}
          <p className="text-sm md:text-base text-muted-foreground mb-8">
            Lütfen ödeme bilgilerinizi kontrol edip tekrar deneyin.
            <br />
            Sorun devam ederse bizimle iletişime geçebilirsiniz.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" size="lg" onClick={() => navigate("/")} className="w-full sm:w-auto">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Ana Sayfaya Dön ve Tekrar Dene
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs md:text-sm text-muted-foreground mt-8">Destek için: support@thirteenconcept.com</p>
        </Card>
      </div>
    </div>
  );
};

export default PaymentError;
