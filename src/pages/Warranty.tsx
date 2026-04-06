import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Warranty = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfa
          </Button>
        </Link>

        <div className="text-center mb-8">
          <Shield className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
            Sıfır Risk Garantisi
          </h1>
          <p className="text-xl text-muted-foreground">
            Risk Yok. Sıfır. Tüm risk benim üzerimde.
          </p>
        </div>

        {/* Main Guarantee Box */}
        <Card className="p-6 md:p-8 lg:p-10 bg-dark-surface border-primary/50 mb-8">
          <div className="space-y-6">
            <div className="bg-primary/10 rounded-xl p-6 md:p-8 border border-primary/30">
              <p className="text-lg sm:text-xl md:text-2xl font-display text-primary text-center leading-relaxed">
                12 hafta sonunda gelişim olmazsa, hedefine ulaşana seninle{" "}
                <span className="font-bold uppercase">ÜCRETSİZ</span>{" "}
                bir şekilde çalışıyorum.
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-display text-primary text-center leading-relaxed mt-4">
                Risk tamamen benim üzerimde.
              </p>
            </div>
          </div>
        </Card>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">Garanti Nasıl İşliyor?</h2>
            <p className="text-muted-foreground">
              Sıçrama360™ programını 12 hafta boyunca uygula. Antrenmanları yap, haftalık check-in'lere katıl 
              ve ölçümlerini kaydet. Eğer 12 hafta sonunda sıçramanda hiç gelişim olmadıysa, seni koçluk grubunda 
              tutup hedefine ulaşana kadar ücretsiz desteklemeye devam ediyorum.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">Garanti Koşulları</h2>
            <p className="text-muted-foreground mb-3">
              Garantiden yararlanmak için aşağıdaki koşulları yerine getirmeniz gerekmektedir:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">1. Program Tamamlama</h3>
                  <p className="text-muted-foreground">
                    12 haftalık programı eksiksiz olarak tamamlamış olmanız gerekir. 
                    Her antrenman seansını belirlenen kurallara göre uygulamış olmalısınız.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">2. Haftalık Check-in</h3>
                  <p className="text-muted-foreground">
                    Haftalık check-in'lere düzenli olarak katılmış ve ilerlemenizi 
                    raporlamış olmanız gerekir. Minimum %80 katılım oranı zorunludur.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">3. Ölçüm Kayıtları</h3>
                  <p className="text-muted-foreground">
                    Başlangıç ve bitiş ölçümlerinizi (sıçrama yüksekliği) kaydetmiş ve 
                    belgelemiş olmanız gerekir. Video kaydı veya fotoğraf kanıtı istenir.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">4. Program Kurallarına Uyum</h3>
                  <p className="text-muted-foreground">
                    Programda belirtilen talimatları eksiksiz uygulamış, koç önerilerini 
                    dikkate almış ve belirlenen protokollere uymuş olmanız gerekir.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">Neden Bu Garanti?</h2>
            <p className="text-muted-foreground">
              Programımızın etkinliğine %100 güveniyoruz. Yıllardır sporcularla çalıştık ve sonuçları gördük. 
              Bu garanti, sizin için tüm riski üstlendiğimizi gösterir. Tek yapmanız gereken programı 
              eksiksiz uygulamak. Gelişim olmazsa, hedefine ulaşana kadar yanındayım.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">Önemli Notlar</h2>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Garanti sadece ilk kez program satın alan kullanıcılar için geçerlidir</li>
                <li>Haftalık check-in ve ölçüm zorunludur</li>
                <li>Koşulları yerine getirmeden garanti talep edilemez</li>
                <li>Garanti kapsamında ücretsiz destek, hedef sıçrama artışına ulaşana kadar devam eder</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">İletişim</h2>
            <p className="text-muted-foreground">
              Garanti koşulları hakkında sorularınız için müşteri hizmetleri ile iletişime geçebilirsiniz.
            </p>
          </section>

          <section className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Warranty;
