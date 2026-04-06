import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const KVKK = () => {
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
          Kişisel Verilerin Korunması ve İşlenmesi Politikası (KVKK)
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">1. Veri Sorumlusu</h2>
            <p className="text-muted-foreground">
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; 
              veri sorumlusu olarak Uzay Demiral On3 Yazılım Hizmetleri ("Şirket") tarafından aşağıda 
              açıklanan kapsamda işlenebilecektir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">2. Kişisel Verilerin İşlenme Amacı</h2>
            <p className="text-muted-foreground mb-3">
              Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Sipariş ve ödeme işlemlerinin gerçekleştirilmesi</li>
              <li>Ürün ve hizmetlerin sunulması</li>
              <li>Müşteri ilişkileri yönetimi</li>
              <li>İletişim faaliyetlerinin yürütülmesi</li>
              <li>Pazarlama ve kampanya faaliyetleri</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Hukuki işlemlerin takibi</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">3. İşlenen Kişisel Veriler</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Kimlik bilgileri (ad, soyad)</li>
              <li>İletişim bilgileri (e-posta, telefon)</li>
              <li>Finansal bilgiler (ödeme bilgileri)</li>
              <li>Müşteri işlem bilgileri</li>
              <li>İşlem güvenliği bilgileri</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">4. Kişisel Verilerin Aktarımı</h2>
            <p className="text-muted-foreground">
              Toplanan kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda 
              iş ortaklarımıza, tedarikçilerimize, hukuki ve teknik danışmanlarımıza, kanunen yetkili kamu 
              kurumlarına ve özel kişilere KVK Kanunu'nun 8. ve 9. maddelerinde belirtilen kişisel veri 
              işleme şartları ve amaçları çerçevesinde aktarılabilecektir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">5. Veri Sahibinin Hakları</h2>
            <p className="text-muted-foreground mb-3">
              KVKK'nın 11. maddesi uyarınca, kişisel veri sahipleri olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
              <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
              <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
              <li>Kişisel verilerin düzeltilmesi, silinmesi veya yok edilmesi halinde bu işlemlerin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl md:text-3xl mb-4">6. İletişim</h2>
            <p className="text-muted-foreground">
              Kişisel verilerinizle ilgili sorularınız ve talepleriniz için bizimle iletişime geçebilirsiniz.
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

export default KVKK;
