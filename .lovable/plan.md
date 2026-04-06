

## 4'lü Fiyatlandırma Yapısı — Decoy Stratejisi

Mevcut 3 sütunlu yapıyı 4 sütuna çeviriyoruz: Temel → Yem (Decoy) → Elit (Asıl Hedef) → VIP (Çıpa).

### Değişiklikler

#### 1. Fiyat ve İçerik Güncellemesi (Index.tsx — TIERS dizisi)

**Temel Paket**: 1.250 TL → **2.450 TL**
- 12 Haftalık Sıçrama ve Gelişim Sistemi (Dijital Program)
- Temel Egzersiz Videoları
- Bonus yok, tişört yok, görüşme yok

**Yem Teklif (YENİ)**: **3.450 TL** — id: `yem`
- Premium Athlevo Sporcu Tişörtü (Adrese Teslim)
- 45 Dakikalık Birebir Hedef Belirleme Görüşmesi
- Mevcut rehberler (Beslenme Rehberi, Şampiyon Manifestosu vs.)
- Dijital program YOK, egzersiz videoları YOK
- Badge yok, highlight yok

**Elit Paket**: 2.950 TL → **3.450 TL** — Aynı fiyat!
- Temel Paketteki HER ŞEY
- Yem Paketteki HER ŞEY
- Mevcut bonuslar (Masterclass, Diz Protokolü, Takip Sistemi, Beslenme Rehberi, Sporcu Kutusu)
- Badge: "EN ÇOK TERCİH EDİLEN", highlight: true

**VIP Mentörlük**: **8.900 TL** (değişmez)
- Elit Paketteki HER ŞEY
- Diyetisyen + Fizyoterapist Takibi

#### 2. Grid Layout Güncellemesi (Index.tsx — Pricing Section)
- `md:grid-cols-3` → `md:grid-cols-2 lg:grid-cols-4`
- Kartları daha kompakt yaparak 4 sütuna sığdırma
- Yem sütununda X işaretleri ile "dijital program yok" vurgusu

#### 3. PayTR Fiyat Tablosu (create-paytr-payment edge function)
```
TIER_PRICES: temel → 2450, yem → 3450, elit → 3450, vip → 8900
```

#### 4. Yem Tier İçin E-posta Şablonu
`order_confirmation_yem` adında yeni şablon — tişört kargo bilgisi, görüşme randevusu, rehberler. Dijital program linki yok.

#### 5. E-posta Şablonu Güncellemeleri
- **Temel**: İçerik güncelleme (sadece dijital program + temel videolar)
- **Elit**: Mevcut içerik + "Yem paketteki her şey dahil" vurgusu
- **VIP**: Değişiklik yok

#### 6. resend-order-email Edge Function
`yem` tier'ı için bonus asset'leri dahil etmeme mantığı ekleme (dijital program linki gönderilmeyecek, sadece rehberler).

### Teknik Detay
- Toplam 2 edge function güncellemesi (create-paytr-payment, resend-order-email)
- 1 yeni e-posta şablonu INSERT
- 2 mevcut e-posta şablonu UPDATE (temel, elit)
- Index.tsx TIERS dizisi ve grid layout güncellemesi

