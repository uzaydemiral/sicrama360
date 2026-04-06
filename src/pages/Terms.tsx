import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
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
          Kullanım Şartları
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">1. Genel Hükümler</h2>
            <p className="text-muted-foreground">
              Bu web sitesini kullanarak, aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. 
              Uzay Demiral On3 Yazılım Hizmetleri ("Şirket"), bu şartları herhangi bir zamanda 
              değiştirme hakkını saklı tutar.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">2. Hizmet Kapsamı</h2>
            <p className="text-muted-foreground">
              Şirketimiz, basketbol antrenman programları ve koçluk hizmetleri sunmaktadır. 
              Tüm programlar dijital ortamda sunulmakta olup, kullanıcılar bu programlara 
              internet üzerinden erişim sağlayabilir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">3. Kullanıcı Yükümlülükleri</h2>
            <p className="text-muted-foreground mb-3">
              Kullanıcılar aşağıdaki yükümlülükleri kabul eder:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Doğru ve güncel bilgi sağlamak</li>
              <li>Hesap güvenliğini korumak</li>
              <li>Yasalara ve düzenlemelere uymak</li>
              <li>Fikri mülkiyet haklarına saygı göstermek</li>
              <li>Hizmeti kötüye kullanmamak</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">4. Fikri Mülkiyet Hakları</h2>
            <p className="text-muted-foreground">
              Bu web sitesinde yer alan tüm içerik, tasarım, logo, metin, grafik ve diğer 
              materyaller Şirketin mülkiyetindedir ve telif hakkı yasaları ile korunmaktadır. 
              İzinsiz kopyalama, dağıtma veya kullanma yasaktır.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">5. Satın Alma ve Ödeme</h2>
            <p className="text-muted-foreground">
              Tüm satın alımlar, ödeme sırasında belirtilen şartlara tabidir. Ödeme işlemleri 
              güvenli ödeme sistemleri aracılığıyla gerçekleştirilir. Fiyatlar Türk Lirası 
              cinsinden belirtilmiştir ve KDV dahildir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">6. Hizmet Erişimi</h2>
            <p className="text-muted-foreground">
              Satın alınan dijital ürünlere erişim, ödeme onayını takiben e-posta ile 
              gönderilecektir. Erişim bilgileri kişiseldir ve üçüncü kişilerle paylaşılmamalıdır.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">7. Sorumluluk Sınırlaması</h2>
            <p className="text-muted-foreground">
              Şirket, programların kullanımından kaynaklanan yaralanma veya sağlık sorunlarından 
              sorumlu değildir. Kullanıcılar, egzersizlere başlamadan önce bir sağlık uzmanına 
              danışmalıdır. Hizmetler "olduğu gibi" sunulmaktadır.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">8. Hizmet Değişiklikleri</h2>
            <p className="text-muted-foreground">
              Şirket, önceden haber vermeksizin hizmetlerini değiştirme, askıya alma veya 
              sonlandırma hakkını saklı tutar.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">9. Hesap Sonlandırma</h2>
            <p className="text-muted-foreground">
              Şirket, kullanım şartlarını ihlal eden kullanıcıların hesaplarını önceden 
              haber vermeksizin askıya alma veya sonlandırma hakkına sahiptir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">10. Uygulanacak Hukuk</h2>
            <p className="text-muted-foreground">
              Bu kullanım şartları Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıkların 
              çözümünde Türkiye mahkemeleri yetkilidir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">11. İletişim</h2>
            <p className="text-muted-foreground">
              Kullanım şartları hakkında sorularınız için bizimle iletişime geçebilirsiniz.
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

export default Terms;
