import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const DistanceSales = () => {
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
          Mesafeli Satış Sözleşmesi
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">1. Taraflar</h2>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">SATICI:</p>
                <p>Ünvan: Uzay Demiral On3 Yazılım Hizmetleri</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">ALICI:</p>
                <p>Sipariş formunu onaylayan müşteri</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">2. Sözleşme Konusu</h2>
            <p className="text-muted-foreground">
              İşbu sözleşmenin konusu, SATICI'ya ait www.siteniz.com internet sitesinden 
              ALICI'nın elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış 
              fiyatı belirtilen ürün/hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı 
              Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği 
              hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">3. Sözleşme Konusu Ürün/Hizmet Bilgileri</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><span className="font-semibold text-foreground">Ürün/Hizmet:</span> Sıçrama360™ 90 Günlük Basketbol Antrenman Programı</p>
              <p><span className="font-semibold text-foreground">Fiyat:</span> 4.499 TL (KDV Dahil)</p>
              <p><span className="font-semibold text-foreground">Ödeme Şekli:</span> Kredi kartı veya banka havalesi</p>
              <p><span className="font-semibold text-foreground">Teslimat Şekli:</span> Dijital teslimat (E-posta ile erişim bilgileri gönderimi)</p>
              <p><span className="font-semibold text-foreground">Teslimat Süresi:</span> Ödeme onayını takiben 24 saat içinde</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">4. Genel Hükümler</h2>
            <p className="text-muted-foreground">
              ALICI, www.siteniz.com internet sitesinde sözleşme konusu ürün/hizmetin temel 
              nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri 
              okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini 
              kabul, beyan ve taahhüt eder.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">5. Fatura Bilgileri</h2>
            <p className="text-muted-foreground">
              Ödeme onayını takiben, ALICI'ya sipariş özet bilgilerini ve fatura bilgilerini 
              içeren e-posta gönderilecektir. Fatura elektronik ortamda düzenlenecek ve 
              ALICI'nın e-posta adresine gönderilecektir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">6. SATICI'nın Hak ve Yükümlülükleri</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>SATICI, sözleşme konusu ürün/hizmeti eksiksiz ve zamanında teslim etmekle yükümlüdür</li>
              <li>SATICI, dijital içeriğe erişim bilgilerini güvenli şekilde iletmekle yükümlüdür</li>
              <li>SATICI, teknik destek sağlamakla yükümlüdür</li>
              <li>SATICI, ALICI'nın kişisel verilerini korumakla yükümlüdür</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">7. ALICI'nın Hak ve Yükümlülükleri</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>ALICI, sözleşme konusu ürün/hizmetin bedel ve fiyatını ödemekle yükümlüdür</li>
              <li>ALICI, erişim bilgilerini güvenli tutmakla yükümlüdür</li>
              <li>ALICI, dijital içeriği üçüncü kişilerle paylaşmamakla yükümlüdür</li>
              <li>ALICI, doğru ve güncel bilgi vermekle yükümlüdür</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">8. Cayma Hakkı İstisnası</h2>
            <p className="text-muted-foreground">
              6502 sayılı Tüketicinin Korunması Hakkında Kanun'un 15. maddesinin (ı) bendi 
              uyarınca, elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında 
              teslim edilen gayrimaddi mallar için cayma hakkı kullanılamaz. ALICI, dijital 
              içeriğe erişim sağladıktan sonra cayma hakkını kullanamayacağını kabul eder.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">9. Mücbir Sebepler</h2>
            <p className="text-muted-foreground">
              Mücbir sebep halleri nedeniyle sözleşme konusu ürün/hizmet süresi içinde 
              teslim edilemez ise, SATICI durumu ALICI'ya bildirmekle yükümlüdür. ALICI 
              da siparişin iptal edilmesini, benzer bir ürün ile değiştirilmesini veya 
              engel durumun ortadan kalkmasına kadar teslimatın ertelenmesini talep 
              edebilir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">10. Uyuşmazlık Çözümü</h2>
            <p className="text-muted-foreground">
              İşbu sözleşmenin uygulanmasından veya yorumlanmasından doğacak her türlü 
              uyuşmazlığın çözümünde, Türkiye Cumhuriyeti yasaları uygulanır. Uyuşmazlıkların 
              çözümünde Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">11. Yürürlük</h2>
            <p className="text-muted-foreground">
              ALICI, işbu sözleşmeyi elektronik ortamda onayladığı takdirde, sözleşme konusu 
              ürün/hizmet ile ilgili ön bilgileri edindiğini ve elektronik ortamda gerekli 
              teyidi verdiğini kabul eder. İşbu sözleşme, ALICI tarafından elektronik ortamda 
              onaylanması ile yürürlüğe girer.
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

export default DistanceSales;
