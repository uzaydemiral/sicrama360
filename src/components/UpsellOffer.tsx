import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill, Sun, Zap, Gift, Check, X } from "lucide-react";

interface UpsellOfferProps {
  onAccept: () => void;
  onDecline: () => void;
  loading?: boolean;
}

export const UpsellOffer = ({ onAccept, onDecline, loading }: UpsellOfferProps) => {
  return (
    <div className="space-y-5">
      {/* Warning Header */}
      <div className="text-center space-y-3">
        <p className="text-lg md:text-xl font-bold text-destructive">🛑 DUR! EMEKLERİNİ ÇÖPE ATMA.</p>
        <p className="text-muted-foreground text-sm">
          "Antrenman yıkar, beslenme yapar." Vücuduna doğru yakıtı koymazsan, sadece yorgunluk biriktirirsin.
        </p>
        <p className="text-foreground text-sm font-medium">
          Rastgele vitamin arama. Diyetisyeninin senin için hazırladığı TAM SİSTEMİ (Ürün + Bilgi) tek tıkla al.
        </p>
      </div>

      {/* Product Card */}
      <Card className="p-5 md:p-6 bg-dark-surface border-primary/50">
        <p className="text-primary font-bold text-base mb-4">📦 DİYETİSYEN ONAYLI "ELİT TOPARLANMA PAKETİ"</p>

        {/* Supplements List */}
        <div className="space-y-3 mb-5">
          <div className="flex gap-3">
            <Pill className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">✅ SÜPER-OMEGA (Krill + Q10 + Astaksantin)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sıradan balık yağı değil. Beyin odağı, eklem zırhı ve hücresel enerji için biyo-hacker formülü.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Sun className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">✅ 4'LÜ MAGNEZYUM KOMPLEKSİ</p>
              <p className="text-xs text-muted-foreground mt-1">
                Derin uyku, büyüme hormonu desteği ve kramp önleyici.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Zap className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">✅ ANTRENMAN YAKITI (Energy Chews)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Antrenmanda tükenmeyen patlayıcı güç.
              </p>
            </div>
          </div>
        </div>

        {/* Bonuses */}
        <div className="bg-primary/10 rounded-lg p-4 mb-5 border border-primary/30">
          <p className="text-primary font-bold text-sm mb-3">🎁 SADECE BU KUTUDA GEÇERLİ HEDİYELER:</p>
          
          <div className="flex gap-2">
            <Gift className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              <span className="font-medium">⏰ "Supplement Zamanlama Takvimi"</span>
              <span className="text-muted-foreground"> — Hangi ürünü, ne zaman almalısın? Maksimum etki için kullanım kılavuzu.</span>
            </p>
          </div>
        </div>

        {/* Why section */}
        <div className="mb-5">
          <p className="text-foreground font-bold text-sm mb-2">📉 FIRSATI KAÇIRMA</p>
          <p className="text-xs text-muted-foreground">
            Eczane gezme, yanlış ürün alma. En iyileri seçtik, kullanım rehberini yazdık.
          </p>
        </div>

        {/* Pricing */}
        <div className="bg-background/50 rounded-lg p-4 mb-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <X className="w-4 h-4 inline text-destructive mr-1" />
              Toplam Paket Değeri:{" "}
              <span className="line-through">3.800 TL</span>
            </p>
            <p className="text-lg font-bold text-primary">
              <Check className="w-5 h-5 inline text-primary mr-1" />
              TEK TIKLA KUTUNA EKLE: 2.590 TL
            </p>
            <p className="text-xs text-muted-foreground">
              (Kargo Ücretsiz & Hemen Eklenir)
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onAccept}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-base animate-pulse"
          size="lg"
        >
          ✅ EVET! FULL SİSTEMİ EKLE (+2.590 TL)
        </Button>
      </Card>

      {/* Decline Link */}
      <button
        onClick={onDecline}
        disabled={loading}
        className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline"
      >
        ❌ Hayır, teşekkürler. Vitaminleri ve beslenmeyi kendim çözeceğim.
      </button>
    </div>
  );
};
