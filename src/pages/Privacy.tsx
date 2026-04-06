import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
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
          Gizlilik Politikası
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">1. Giriş</h2>
            <p className="text-muted-foreground">
              Uzay Demiral On3 Yazılım Hizmetleri olarak, kullanıcılarımızın gizliliğine önem veriyoruz. 
              Bu Gizlilik Politikası, kişisel bilgilerinizi nasıl topladığımızı, kullandığımızı, 
              koruduğumuzu ve paylaştığımızı açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">2. Toplanan Bilgiler</h2>
            <p className="text-muted-foreground mb-3">
              Hizmetlerimizi kullanırken aşağıdaki bilgileri toplayabiliriz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Ad, soyad ve iletişim bilgileri</li>
              <li>E-posta adresi ve telefon numarası</li>
              <li>Ödeme ve fatura bilgileri</li>
              <li>Hizmet kullanım bilgileri</li>
              <li>IP adresi ve cihaz bilgileri</li>
              <li>Çerez ve benzeri teknolojiler aracılığıyla toplanan bilgiler</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">3. Bilgilerin Kullanımı</h2>
            <p className="text-muted-foreground mb-3">
              Topladığımız bilgileri şu amaçlarla kullanırız:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Hizmetlerimizi sunmak ve geliştirmek</li>
              <li>Müşteri desteği sağlamak</li>
              <li>Ödeme işlemlerini gerçekleştirmek</li>
              <li>Size özel içerik ve teklifler sunmak</li>
              <li>Yasal yükümlülüklerimizi yerine getirmek</li>
              <li>Güvenlik ve dolandırıcılık önleme</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">4. Bilgi Paylaşımı</h2>
            <p className="text-muted-foreground">
              Kişisel bilgilerinizi yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşırız:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Hizmet sağlayıcılar (ödeme işlemcileri, hosting sağlayıcıları)</li>
              <li>Yasal zorunluluklar</li>
              <li>İş ortakları (açık izninizle)</li>
              <li>Şirket birleşme veya satışı durumunda</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">5. Veri Güvenliği</h2>
            <p className="text-muted-foreground">
              Kişisel bilgilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz. 
              Ancak, internet üzerinden yapılan hiçbir veri iletiminin %100 güvenli olmadığını 
              unutmamalısınız.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">6. Çerezler</h2>
            <p className="text-muted-foreground">
              Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. 
              Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">7. Haklarınız</h2>
            <p className="text-muted-foreground mb-3">
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Kişisel verilerinize erişim</li>
              <li>Kişisel verilerinizin düzeltilmesi</li>
              <li>Kişisel verilerinizin silinmesi</li>
              <li>Veri işleme faaliyetlerine itiraz</li>
              <li>Veri taşınabilirliği</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">8. Çocukların Gizliliği</h2>
            <p className="text-muted-foreground">
              Hizmetlerimiz 18 yaş altı kişilere yönelik değildir. Çocuklardan bilerek kişisel bilgi toplamıyoruz.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">9. Değişiklikler</h2>
            <p className="text-muted-foreground">
              Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada 
              yayınlandığında yürürlüğe girer.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">10. İletişim</h2>
            <p className="text-muted-foreground">
              Gizlilik politikamız hakkında sorularınız varsa, lütfen bizimle iletişime geçin.
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

export default Privacy;
