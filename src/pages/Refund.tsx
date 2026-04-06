import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Refund = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfa
          </Button>
        </Link>

        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-8">
          İade ve Cayma Koşulları
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">1. Cayma Hakkı</h2>
            <p className="text-muted-foreground">
              6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca, dijital içerik teslimi 
              ile ilgili hizmetlerde, tüketici dijital içeriğe erişim sağladıktan sonra cayma 
              hakkını kullanamaz.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">2. Dijital Ürünler İçin Özel Durum</h2>
            <p className="text-muted-foreground">
              Sunduğumuz programlar dijital içerik niteliğindedir. Ödemenin onaylanmasını ve 
              programa erişim bilgilerinin gönderilmesini takiben cayma hakkı sona erer. 
              Satın alma işlemi sırasında bu husus açıkça bildirilir ve onayınız alınır.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">3. Garanti Kapsamında İade</h2>
            <p className="text-muted-foreground mb-3">
              "Şaşırtan Gelişim Garantisi" kapsamında iade talep edebilirsiniz. Garanti şartları:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>90 günlük programı eksiksiz tamamlamış olmak</li>
              <li>Haftalık check-in'lere düzenli katılım göstermiş olmak</li>
              <li>Programı belirlenen kurallara göre uygulamış olmak</li>
              <li>Başlangıç ve bitiş ölçümlerini yapmış olmak</li>
              <li>Program bitiminden itibaren 14 gün içinde başvurmuş olmak</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">4. İade Başvuru Süreci</h2>
            <p className="text-muted-foreground mb-3">
              Garanti kapsamında iade talebinde bulunmak için:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
              <li>Müşteri hizmetleri ile iletişime geçin</li>
              <li>Program tamamlama belgelerini sunun</li>
              <li>Check-in kayıtlarınızı paylaşın</li>
              <li>Başlangıç ve bitiş ölçüm sonuçlarını gönderin</li>
              <li>İade talebiniz 7 iş günü içinde değerlendirilir</li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">5. İade Onayı ve Süreç</h2>
            <p className="text-muted-foreground">
              İade talebiniz onaylandığında, ödeme yaptığınız kredi kartına veya banka hesabına 
              iade işlemi başlatılır. İade tutarının hesabınıza yansıma süresi, bankanıza göre 
              2-10 iş günü arasında değişebilir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">6. İade Edilemeyecek Durumlar</h2>
            <p className="text-muted-foreground mb-3">
              Aşağıdaki durumlarda iade talepleri kabul edilmez:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Programı tamamlamamış olmak</li>
              <li>Check-in'lere düzenli katılım göstermemiş olmak</li>
              <li>Talimatları uygulamadan farklı egzersiz yapmış olmak</li>
              <li>Sağlık sorunu nedeniyle programı yarıda bırakmış olmak</li>
              <li>90 gün sonrasında başvurmuş olmak</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">7. Teknik Sorunlar</h2>
            <p className="text-muted-foreground">
              Programa erişimde teknik sorun yaşamanız durumunda, derhal müşteri hizmetleri 
              ile iletişime geçin. Bizim kaynaklı teknik sorunlar için alternatif çözümler 
              sunulacaktır.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">8. İletişim</h2>
            <p className="text-muted-foreground">
              İade ve cayma koşulları hakkında sorularınız için müşteri hizmetleri ile 
              iletişime geçebilirsiniz.
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

export default Refund;
