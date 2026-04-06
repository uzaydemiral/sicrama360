import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  Check,
  X,
  CheckCircle2,
  Shield,
  Users,
  Target,
  Zap,
  Activity,
  Video,
  Volume2,
  VolumeX,
  TrendingUp,
  Package,
  Star,
  Crown,
  Dumbbell,
  HeartPulse,
  BookOpen,
  Gift,
  ChevronDown,
} from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";

import { CookieConsent } from "@/components/CookieConsent";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import WhatsAppButton from "@/components/WhatsAppButton";
import CountdownTimer from "@/components/CountdownTimer";
import ProgramDemo from "@/components/ProgramDemo";
import JumpCalculator from "@/components/JumpCalculator";
import Navbar from "@/components/Navbar";

import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  age: string;
  sport: string;
  before_cm: number;
  after_cm: number;
  improvement_cm: number;
  quote: string;
  weeks_completed: string;
  video_url: string | null;
  is_featured: boolean;
  display_order: number;
}

interface ProgramStats {
  total_athletes: number;
  total_cm_gained: number;
  average_improvement: number;
}

const getYouTubeEmbedUrl = (url: string | null, muted: boolean = true) => {
  if (!url) return null;
  if (url.includes("youtube.com/embed/")) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("mute", muted ? "1" : "0");
      return urlObj.toString();
    } catch {
      return url;
    }
  }
  const videoIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|^)([a-zA-Z0-9_-]{11})/;
  const videoMatch = url.match(videoIdRegex);
  if (!videoMatch?.[1]) return null;
  const videoId = videoMatch[1];
  const siMatch = url.match(/[?&]si=([^&]+)/);
  const siParam = siMatch?.[1];
  const params = new URLSearchParams({
    autoplay: "1",
    mute: muted ? "1" : "0",
    loop: "1",
    playlist: videoId,
    controls: "1",
    modestbranding: "1",
    rel: "0",
  });
  if (siParam) params.set("si", siParam);
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const PRODUCT_ID = "63112ab4-e76e-484d-b106-c4d771a761a6";

const TIERS = [
  {
    id: "temel",
    name: "Temel Paket",
    icon: Dumbbell,
    price: 2450,
    badge: null,
    description: "Sadece Dijital — Başlangıç Seviye",
    installmentText: "(Aylık sadece 204 TL'den başlayan taksitlerle)",
    features: [
      "12 Haftalık Sıçrama ve Gelişim Sistemi (Dijital)",
      "Temel Egzersiz Videoları",
    ],
    excluded: [] as string[],
    bonuses: [],
    cta: "Satın Al ve Başla",
    highlight: false,
  },
  {
    id: "yem",
    name: "Fiziksel & Danışmanlık",
    icon: Package,
    price: 3450,
    badge: null,
    description: "Tişört + Görüşme + Rehberler (Program Yok!)",
    installmentText: "(Aylık sadece 287 TL'den başlayan taksitlerle)",
    features: [
      "Premium Athlevo Sporcu Tişörtü (Adrese Teslim)",
      "45 Dk. Birebir Hedef Belirleme Görüşmesi",
      "Altyapı Sporcuları İçin Beslenme Rehberi",
      "Şampiyon Manifestosu",
    ],
    excluded: [
      "12 Haftalık Dijital Program",
      "Egzersiz Videoları",
    ],
    bonuses: [],
    cta: "Bu Paketi Seç",
    highlight: false,
  },
  {
    id: "elit",
    name: "Elit Paket",
    icon: Star,
    price: 3450,
    badge: "EN ÇOK TERCİH EDİLEN",
    description: "HER ŞEY Dahil — Aynı Fiyata!",
    installmentText: "(Aylık sadece 287 TL'den başlayan taksitlerle — tüm bonuslar dahil!)",
    features: [
      "Temel Paketteki HER ŞEY",
      "Yandaki Paketteki HER ŞEY",
    ],
    excluded: [] as string[],
    bonuses: [
      { title: "Sıçrama Mekaniği Masterclass", value: "1.000 TL" },
      { title: "Diz Ağrısı Çözüm Protokolü", value: "1.000 TL" },
      { title: "Athlevo Antrenman Takip Sistemi", value: "500 TL" },
      { title: "Altyapı Sporcuları İçin Beslenme Rehberi", value: "500 TL" },
      { title: "Athlevo Sporcu Kutusu (Hediye!)", value: "HEDİYE", isBox: true },
    ],
    cta: "Elit Paketi Seç",
    highlight: true,
  },
  {
    id: "vip",
    name: "VIP Mentörlük",
    icon: Crown,
    price: 8900,
    badge: "MAKSİMUM SONUÇ",
    description: "Her Şey + Birebir Uzman Desteği",
    installmentText: "(Aylık sadece 741 TL'den başlayan taksitlerle 1-1 uzman desteği)",
    features: [
      "Elit Paketteki HER ŞEY",
    ],
    excluded: [] as string[],
    bonuses: [
      { title: "Süreç Boyunca Diyetisyen Takibi", value: "3.000 TL" },
      { title: "Süreç Boyunca Fizyoterapist Takibi", value: "3.000 TL" },
    ],
    cta: "VIP Başvurusu Yap",
    highlight: false,
  },
];

const Index = () => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(TIERS[1]); // Default to Elit
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<ProgramStats | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchProductVideo = async () => {
      const { data } = await supabase.from("products").select("video_url").eq("id", PRODUCT_ID).single();
      if (data?.video_url) setHeroVideoUrl(data.video_url);
    };
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (data && !error) setTestimonials(data);
    };
    const fetchStats = async () => {
      const { data, error } = await supabase.from("program_stats").select("*").single();
      if (data && !error) setStats(data);
    };
    fetchProductVideo();
    fetchTestimonials();
    fetchStats();
  }, []);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectTier = (tier: typeof TIERS[0]) => {
    setSelectedTier(tier);
    setPaymentModalOpen(true);
  };

  const toggleMute = () => {
    if (iframeRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      iframeRef.current.src = iframeRef.current.src.replace(/mute=\d/, `mute=${newMutedState ? 1 : 0}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* ═══════════════ SECTION 1: HERO ═══════════════ */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          {/* Full-width title */}
          <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-8 mb-10 md:mb-14">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight">
              Altyapı Basketbolcuları İçin:{" "}
              <span className="text-gradient">12 Haftada Sıçramanı 15cm Artır</span>{" "}
              ve İlk 5'e Gir –{" "}
              <span className="text-gradient opacity-90">Spor Salonuna Gitmene Gerek Kalmadan.</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium">
              Sakatlık riskini azaltan, evde uygulanabilir, kanıtlanmış sistem.
            </p>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 max-w-lg mx-auto">
              <p className="text-sm sm:text-base text-foreground font-semibold">
                ⚡ Kontenjan: <span className="text-primary">50 Kişi</span>
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 md:gap-4">
              <Button variant="hero" size="xl" onClick={scrollToPricing} className="w-full sm:w-auto text-base md:text-lg">
                Programa Hemen Başlamak İstiyorum
              </Button>
            </div>

            <Card className="p-4 md:p-5 bg-dark-surface border-primary/30 max-w-xl mx-auto">
              <div className="flex items-start gap-3">
                <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="font-display text-sm sm:text-base text-foreground mb-1">Sıfır Risk Garantisi</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    12 hafta sonunda gelişim olmazsa, hedefine ulaşana seninle ücretsiz bir şekilde çalışıyorum. Risk tamamen benim üzerimde.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Video below title */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur-3xl" />
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden border-4 border-primary/20 shadow-[0_20px_60px_-15px_rgba(251,83,21,0.5)] aspect-video group">
                {getYouTubeEmbedUrl(heroVideoUrl, isMuted) ? (
                  <>
                    <iframe
                      ref={iframeRef}
                      src={getYouTubeEmbedUrl(heroVideoUrl, isMuted)!}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="eager"
                      referrerPolicy="strict-origin-when-cross-origin"
                      title="Hero Video"
                    />
                    <button
                      onClick={toggleMute}
                      className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
                      aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted">
                    <Video className="w-16 h-16 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground text-center px-4 space-y-2">
                      <p className="font-medium">{heroVideoUrl ? "Video yüklenemedi" : "Video henüz eklenmedi"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 animate-bounce">
            <div className="flex flex-col items-center gap-1 text-muted-foreground opacity-70 hover:opacity-100 transition-opacity">
              <span className="text-xs md:text-sm">Kaydır</span>
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST STRIP ═══════════════ */}
      <section className="py-8 md:py-12 border-y border-border/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {[
              { icon: Users, label: "1000+ sporcu" },
              { icon: Target, label: "Bilimsel Sıçrama Metodolojisi" },
              { icon: Shield, label: "8+ yıllık saha deneyimi" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2 md:gap-3">
                <item.icon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <p className="font-display text-base md:text-lg">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 2: ÇÖZÜLECEK PROBLEMLER (Değer) ═══════════════ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-dark-surface">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
            Seni Engelleyen <span className="text-primary">5 Problemi Çözüyoruz</span>
          </h2>
          <p className="text-center text-sm md:text-base text-muted-foreground mb-8 md:mb-12">
            Bu sorunlardan hangisi sana tanıdık geliyor?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[
              {
                problem: "\"Spor salonuna gidemiyorum\"",
                solution: "Salon gerekmez! Program tamamen evde veya sahada uygulanabilir şekilde tasarlandı. Vücut ağırlığı + minimal ekipmanla maksimum sonuç.",
                icon: Dumbbell,
              },
              {
                problem: "\"Dizlerim ağrıyor, korkuyorum\"",
                solution: "Diz ağrısı çözüm protokolümüzle ağrıları geçir, güvenle antrenmana devam et. Patellar tendon ve ön diz ağrılarına özel yaklaşım.",
                icon: HeartPulse,
              },
              {
                problem: "\"Hareketleri yanlış yapma korkusu\"",
                solution: "120+ açıklamalı video kütüphanesi ile her hareketi doğru teknikle öğren. Yanlış yapma korkusunu tamamen bitir.",
                icon: Video,
              },
              {
                problem: "\"Ne kadar geliştiğimi bilemiyorum\"",
                solution: "Haftalık sıçrama testi + Athlevo Progress Tracker ile gelişimini cm cinsinden takip et. Motivasyonun hiç düşmesin.",
                icon: TrendingUp,
              },
              {
                problem: "\"Rastgele antrenman yapıyorum, sistem yok\"",
                solution: "12 haftalık bilimsel, ilerlemeli ve basketbol odaklı protokol. Her gün ne yapacağını biliyorsun.",
                icon: Target,
              },
              {
                problem: "\"Yalnız çalışıyorum, destek yok\"",
                solution: "Topluluk erişimi + süreç boyunca mesajlaşma desteği. Asla yalnız değilsin.",
                icon: Users,
              },
            ].map((item, i) => (
              <Card key={i} className="p-5 md:p-6 bg-card border-border/50 hover:border-primary/30 transition-all">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-display text-sm md:text-base text-destructive">{item.problem}</p>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.solution}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ COACH/FOUNDER (Güvenilirlik - erken göster) ═══════════════ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
              Programı Kim Hazırladı?
            </h2>
            <p className="text-center text-sm md:text-base text-muted-foreground mb-8 md:mb-12">
              Sıçrama360™ sisteminin arkasındaki deneyim
            </p>
            <Card className="p-6 md:p-8 lg:p-10 bg-card border-primary/30">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-1 flex justify-center items-start">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30">
                    <Users className="w-16 h-16 md:w-20 md:h-20 text-primary" />
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  <div>
                    <h3 className="font-display text-xl md:text-2xl lg:text-3xl mb-2 text-primary">Uzay Demiral</h3>
                    <p className="text-sm md:text-base text-muted-foreground">Performans Koçu & Athlevo Kurucusu</p>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {[
                      { icon: Target, title: "8+ yıllık saha deneyimi", desc: "Altyapı basketbol ve voleybol sporcularıyla yüzlerce başarılı antrenman" },
                      { icon: Activity, title: "Dikey sıçrama, frenleme, iniş mekaniği ve tendon sağlığı uzmanlığı", desc: "Patlayıcı güç ve mekanik optimizasyon üzerine uygulamalı saha tecrübesi" },
                      { icon: Shield, title: "Bilimsel protokoller", desc: "Athlevo Performans Sisteminin kurucusu" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 md:gap-4">
                        <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-sm md:text-base text-foreground mb-1">{item.title}</div>
                          <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-border/30">
                    <p className="text-sm md:text-base text-foreground italic">
                      "Bu program, Instagram'daki rastgele 'sıçrama antrenmanı' videoları değil; altyapı sporcularıyla yıllardır sahada test ederek oluşturduğum bilimsel bir gelişim sistemidir."
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 3: BAŞARI KANITLARI (Testimonials) ═══════════════ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-dark-surface">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
              Sporcuların <span className="text-primary">Gerçek Sonuçları</span>
            </h2>
            <p className="text-center text-sm md:text-base text-muted-foreground mb-8 md:mb-12">
              Sıçrama360™ ile gelişen sporculardan bazıları
            </p>

            {/* Stats Counter */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10 md:mb-14">
                <div className="text-center space-y-1">
                  <AnimatedCounter target={stats.total_athletes} duration={2500} suffix="+" />
                  <div className="text-xs md:text-sm text-muted-foreground">Eğitilen Sporcu</div>
                </div>
                <div className="text-center space-y-1">
                  <AnimatedCounter target={stats.total_cm_gained} duration={2500} suffix=" cm" />
                  <div className="text-xs md:text-sm text-muted-foreground">Toplam Kazanılan</div>
                </div>
                <div className="text-center space-y-1">
                  <AnimatedCounter target={stats.average_improvement} duration={2500} suffix=" cm" decimals={1} />
                  <div className="text-xs md:text-sm text-muted-foreground">Ort. Gelişim</div>
                </div>
              </div>
            )}

            <Carousel
              opts={{ align: "start", loop: true }}
              plugins={[Autoplay({ delay: 3000 })]}
              className="w-full max-w-5xl mx-auto"
            >
              <CarouselContent>
                {testimonials.filter((t) => !t.video_url).map((testimonial) => (
                  <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="p-6 bg-card border-border/50 hover:border-primary/50 transition-all h-full">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-base">{testimonial.name}</h4>
                                <p className="text-xs text-muted-foreground">{testimonial.age} • {testimonial.sport}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3 bg-primary/5 rounded-lg p-3">
                            <div className="flex-1 text-center border-r border-border/30">
                              <p className="text-2xl font-bold text-foreground">{testimonial.before_cm}</p>
                              <p className="text-xs text-muted-foreground">Başlangıç</p>
                            </div>
                            <div className="flex-1 text-center border-r border-border/30">
                              <p className="text-2xl font-bold text-primary">+{testimonial.improvement_cm}</p>
                              <p className="text-xs text-muted-foreground">Gelişim</p>
                            </div>
                            <div className="flex-1 text-center">
                              <p className="text-2xl font-bold text-foreground">{testimonial.after_cm}</p>
                              <p className="text-xs text-muted-foreground">Sonuç</p>
                            </div>
                          </div>
                          <blockquote className="text-sm italic text-muted-foreground leading-relaxed">"{testimonial.quote}"</blockquote>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/30">
                            <CheckCircle2 className="w-3 h-3 text-primary" />
                            <span>{testimonial.weeks_completed}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 md:-left-12" />
              <CarouselNext className="right-0 md:-right-12" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* ═══════════════ PROGRAM DEMO ═══════════════ */}
      <ProgramDemo />

      {/* ═══════════════ SECTION 4: "AMA DURUN, DAHASI VAR!" BONUS REVEAL ═══════════════ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-dark-surface relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 max-w-5xl relative">
          {/* Dramatic reveal header */}
          <div className="text-center mb-10 md:mb-16">
            <p className="text-primary font-bold text-lg md:text-xl mb-3 animate-pulse">⚡ AMA DURUN...</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6">
              <span className="text-primary">DAHASI VAR!</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Bu programdan <span className="text-foreground font-semibold">maksimum verimi almanızı</span> ve hiçbir eksiğinizin kalmamasını istiyorum. 
              Bu yüzden, bugün programa katılanlara inanılmaz bonuslar hazırladım...
            </p>
          </div>

          {/* Bonus 1: Masterclass */}
          <div className="space-y-6 md:space-y-8">
            <Card className="p-5 md:p-8 bg-card border-primary/30 relative overflow-hidden group hover:border-primary/60 transition-all">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold rounded-bl-lg">
                BONUS #1 — Değeri: 1.000 TL
              </div>
              <div className="flex items-start gap-4 mt-6 md:mt-4">
                <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg md:text-xl text-foreground">Sıçrama Mekaniği Masterclass</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sıçrama formu, iniş mekaniği ve yük aktarımı üzerine derin eğitim. Doğru teknikle aynı güçten %20 daha fazla sıçrama yüksekliği elde et.
                  </p>
                  <p className="text-xs text-primary font-medium">🎁 Bugün katılanlara ÜCRETSİZ</p>
                </div>
              </div>
            </Card>

            {/* Bonus 2: Diz Ağrısı */}
            <Card className="p-5 md:p-8 bg-card border-primary/30 relative overflow-hidden group hover:border-primary/60 transition-all">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold rounded-bl-lg">
                BONUS #2 — Değeri: 1.000 TL
              </div>
              <div className="flex items-start gap-4 mt-6 md:mt-4">
                <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <HeartPulse className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg md:text-xl text-foreground">Diz Ağrısı Çözüm Protokolü</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Patellar tendon ve ön diz ağrıları için temel çözüm protokolü. Ağrısız antrenmana dön.
                  </p>
                  <p className="text-xs text-primary font-medium">🎁 Bugün katılanlara ÜCRETSİZ</p>
                </div>
              </div>
            </Card>

            {/* Bonus 3: Antrenman Takip */}
            <Card className="p-5 md:p-8 bg-card border-primary/30 relative overflow-hidden group hover:border-primary/60 transition-all">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold rounded-bl-lg">
                BONUS #3 — Değeri: 500 TL
              </div>
              <div className="flex items-start gap-4 mt-6 md:mt-4">
                <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg md:text-xl text-foreground">Athlevo Antrenman Takip Sistemi</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Günlük antrenman takibi, egzersiz tamamlama ve ilerleme grafikleri. Motivasyonun hiç düşmesin.
                  </p>
                  <p className="text-xs text-primary font-medium">🎁 Bugün katılanlara ÜCRETSİZ</p>
                </div>
              </div>
            </Card>

            {/* Bonus 4: Beslenme Rehberi */}
            <Card className="p-5 md:p-8 bg-card border-primary/30 relative overflow-hidden group hover:border-primary/60 transition-all">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold rounded-bl-lg">
                BONUS #4 — Değeri: 500 TL
              </div>
              <div className="flex items-start gap-4 mt-6 md:mt-4">
                <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg md:text-xl text-foreground">Altyapı Sporcuları İçin Beslenme Rehberi</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Performans, toparlanma ve gelişim odaklı beslenme programı. Ne yiyeceğini artık tahmin etme.
                  </p>
                  <p className="text-xs text-primary font-medium">🎁 Bugün katılanlara ÜCRETSİZ</p>
                </div>
              </div>
            </Card>

            {/* Bonus 5: SPORCU KUTUSU — The big reveal */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 rounded-2xl blur-lg" />
              <Card className="relative p-6 md:p-10 bg-card border-2 border-primary overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-5 py-2 text-sm font-bold rounded-bl-xl">
                  🎁 MEGA BONUS — HEDİYE
                </div>
                
                <div className="mt-8 md:mt-6 text-center space-y-4 md:space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 border-2 border-primary/30">
                    <Package className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                  </div>
                  
                  <h3 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground">
                    Athlevo <span className="text-primary">"Uçuş Kiti"</span> Sporcu Kutusu
                  </h3>
                  
                  <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    İçinde ihtiyacınız olan tüm ekipmanların bulunduğu sporcu kutusunu{" "}
                    <span className="text-primary font-bold">TAMAMEN ÜCRETSİZ</span> bir bonus olarak kapınıza kargoluyoruz!
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-2xl mx-auto pt-4">
                    {[
                      { icon: "👕", label: "Athlevo Tişörtü" },
                      { icon: "💊", label: "İhtiyacın Olan Supplementler" },
                      { icon: "🧘", label: "Foam Roller" },
                      { icon: "💪", label: "Direnç Lastiği" },
                    ].map((item, i) => (
                      <div key={i} className="bg-primary/5 border border-primary/20 rounded-lg p-3 md:p-4 text-center">
                        <span className="text-2xl md:text-3xl block mb-1">{item.icon}</span>
                        <span className="text-xs md:text-sm text-foreground font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-primary font-bold pt-2">
                    📦 Kargo bizden — kapınıza kadar ücretsiz teslimat!
                  </p>
                </div>
              </Card>
            </div>

            {/* Bonus total value */}
            <div className="text-center pt-6 md:pt-8">
              <p className="text-muted-foreground text-sm md:text-base mb-2">Tüm Bonuslar:</p>
              <p className="font-display text-3xl md:text-4xl lg:text-5xl">
                <span className="text-primary">HEDİYE</span>
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-2">
                Neden bedava? Çünkü bu sisteme inanan sporcuların başarısı, benim en büyük referansım.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 5: 3'LÜ FİYAT TABLOSU ═══════════════ */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-4">
              Sana Uygun <span className="text-primary">Paketi Seç</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Her paket ile 12 haftalık dönüşüm yolculuğuna başla.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-3 lg:gap-4 max-w-7xl mx-auto items-stretch">
            {TIERS.map((tier) => (
              <Card
                key={tier.id}
                className={`relative flex flex-col p-6 md:p-8 transition-all duration-300 card-glow ${
                  tier.highlight
                    ? "border-2 border-primary bg-card shadow-[var(--shadow-orange)] scale-[1.02] md:scale-105 ring-1 ring-primary/20"
                    : tier.id === "yem"
                    ? "border-border/50 bg-card/50 opacity-90 hover:opacity-100 hover:border-primary/30"
                    : "border-border/50 bg-card hover:border-primary/30"
                }`}
              >
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold rounded-full whitespace-nowrap ${tier.highlight ? "badge-pulse" : ""}`}>
                    {tier.badge}
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <tier.icon className={`w-10 h-10 mx-auto mb-3 ${tier.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="font-display text-xl md:text-2xl mb-1">{tier.name}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <div className="text-center mb-6">
                  <p className={`font-display text-4xl md:text-5xl font-bold ${tier.highlight ? "text-primary" : "text-foreground"}`}>
                    {tier.price.toLocaleString("tr-TR")} TL
                  </p>
                  <p className="text-xs md:text-sm text-green-500 italic mt-2 px-2">
                    {tier.installmentText}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2.5 mb-6 flex-1">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{f}</span>
                    </div>
                  ))}

                  {tier.excluded && tier.excluded.length > 0 && (
                    <>
                      <div className="border-t border-border/30 pt-3 mt-3">
                        <p className="text-xs font-bold text-destructive/80 mb-2">❌ DAHİL DEĞİL:</p>
                      </div>
                      {tier.excluded.map((ex, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <X className="w-4 h-4 text-destructive/60 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground line-through">{ex}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {tier.bonuses.length > 0 && (
                    <>
                      <div className="border-t border-border/30 pt-3 mt-3">
                        <p className="text-xs font-bold text-primary mb-2">🎁 BONUSLAR:</p>
                      </div>
                      {tier.bonuses.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Gift className={`w-4 h-4 flex-shrink-0 mt-0.5 ${(b as any).isBox ? "text-primary" : "text-primary/70"}`} />
                          <span className={`text-sm ${(b as any).isBox ? "text-primary font-semibold" : "text-foreground"}`}>
                            {b.title}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <Button
                  variant={tier.highlight ? "hero" : "outline"}
                  size="lg"
                  onClick={() => handleSelectTier(tier)}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </Card>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="text-center mt-8 md:mt-10 space-y-4">
            <p className="text-sm md:text-base text-foreground font-semibold">
              Tüm Kredi Kartlarına 12 Aya Varan Taksit İmkanı
            </p>
            <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
              {["VISA", "Mastercard", "Troy", "PayTR"].map((brand) => (
                <div
                  key={brand}
                  className="bg-muted/50 border border-border/50 rounded-lg px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-medium text-muted-foreground"
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>

          {/* Scarcity */}
          <div className="text-center mt-6 md:mt-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-6 py-3">
              <Users className="w-5 h-5 text-primary" />
              <p className="text-sm sm:text-base text-foreground font-semibold">
                Kontenjan: <span className="text-primary">50 Kişi</span> — Yerini şimdi ayırt!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 6: GARANTİ ═══════════════ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-dark-surface">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-6 md:mb-8">
            <Shield className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-4 md:mb-6" />
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6">
              Sıfır Risk Garantisi
            </h2>
          </div>
          <Card className="p-6 md:p-8 lg:p-10 bg-card border-primary/50">
            <div className="space-y-6">
              <p className="text-base sm:text-lg md:text-xl text-foreground leading-relaxed text-center">
                Programı uygula, antrenmanları yap. Eğer 12 hafta sonunda sıçramanda artış görmezsen, paranı iade etmiyorum...
              </p>
              <div className="bg-primary/10 rounded-xl p-6 md:p-8 border border-primary/30">
                <p className="text-lg sm:text-xl md:text-2xl font-display text-primary text-center leading-relaxed">
                  Seni koçluk grubunda tutup hedefine ulaşana kadar{" "}
                  <span className="font-bold uppercase">ÜCRETSİZ</span>{" "}
                  desteklemeye devam ediyorum.
                </p>
              </div>
              <p className="text-base sm:text-lg md:text-xl text-foreground text-center font-semibold">
                Risk benim üzerimde.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground pt-4 border-t border-border/30 text-center">
                Bu garanti için haftalık check-in + ölçüm zorunludur.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-dark-surface">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center mb-8 md:mb-12">
            Sıkça Sorulan Sorular
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: "Evde yapılabilir mi?", a: "Evet, program tamamen ev odaklı tasarlanmıştır. Minimal ekipman ile maksimum sonuç alacak şekilde yapılandırılmıştır." },
              { q: "Ekipman gerekiyor mu?", a: "Minimal ekipman yeterli: Dirençli bant ve tercihen küçük ağırlıklar. Çoğu egzersiz vücut ağırlığı ile yapılabilir. Elit pakette direnç lastiği ve roller kutuyla birlikte geliyor!" },
              { q: "Sıfır Risk Garantisi nasıl işliyor?", a: "Programı uygula, antrenmanları yap. 12 hafta sonunda gelişim olmazsa seni koçluk grubunda tutup hedefine ulaşana kadar ÜCRETSİZ destekliyorum. Haftalık check-in ve ölçüm zorunludur." },
              { q: "Kaç dakika sürüyor?", a: "Antrenmanlar 30-45 dakika arasında sürer. Haftada 6 gün antrenman yapmanız önerilir." },
              { q: "Paketler arası fark nedir?", a: "Temel Paket (2.450 TL) sadece dijital programı içerir. Elit Paket (3.450 TL) tüm bonuslar + sporcu kutusunu kapınıza kadar getirir — aynı fiyata her şey dahil! VIP Mentörlük (8.900 TL) ise bunlara ek olarak diyetisyen ve fizyoterapist takibi sunar." },
              { q: "Sporcu kutusu ne zaman gelir?", a: "Elit ve VIP paketlerde sporcu kutusu sipariş sonrası 3-5 iş günü içinde kargoya verilir. Kargo tamamen ücretsizdir." },
              { q: "Kontenjan kaç kişi?", a: "Her dönem 50 kişilik kontenjan ile çalışıyorum. Bir sonraki grup Pazartesi başlıyor." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-border/50 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left font-display text-lg hover:text-primary">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══════════════ SICRAMA HESAPLAYICI ═══════════════ */}
      <JumpCalculator />

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section id="final-cta" className="py-12 sm:py-16 md:py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Card className="p-6 md:p-8 lg:p-12 bg-dark-surface border-primary text-center">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6">
              Sıçramanı <span className="text-primary">Artırmaya Hazır mısın?</span>
            </h2>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
              <p className="text-sm sm:text-base text-foreground font-semibold">
                ⚡ Kontenjan: <span className="text-primary">50 Kişi</span> — Yerini şimdi ayırt!
              </p>
            </div>

            <Button
              variant="hero"
              size="xl"
              onClick={scrollToPricing}
              className="w-full sm:w-auto mb-4 text-base md:text-lg"
            >
              Evet, Hazırım — Paketi Seçmek İstiyorum
            </Button>

            <div className="flex items-center justify-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Sıfır Risk Garantisi:</span>{" "}
                <span className="text-primary">Gelişim olmazsa seninle ücretsiz çalışıyorum.</span>
              </p>
            </div>

            <div className="border-t border-border/30 pt-4">
              <p className="text-xs md:text-sm text-muted-foreground italic">
                P.S. Unutma — 12 hafta sonunda gelişim olmazsa seninle ücretsiz çalışmaya devam ediyorum.
                Kaybedecek hiçbir şeyin yok, kazanacağın her şey var. İlk adımı şimdi at.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 border-t border-border/30 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div>
              <h3 className="font-display text-lg mb-4">Yasal</h3>
              <ul className="space-y-2">
                <li><a href="/kvkk" className="text-muted-foreground hover:text-primary transition-colors">KVKK</a></li>
                <li><a href="/gizlilik" className="text-muted-foreground hover:text-primary transition-colors">Gizlilik Politikası</a></li>
                <li><a href="/kullanim-sartlari" className="text-muted-foreground hover:text-primary transition-colors">Kullanım Şartları</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg mb-4">Sözleşmeler</h3>
              <ul className="space-y-2">
                <li><a href="/mesafeli-satis" className="text-muted-foreground hover:text-primary transition-colors">Mesafeli Satış Sözleşmesi</a></li>
                <li><a href="/iade-kosullari" className="text-muted-foreground hover:text-primary transition-colors">İade ve Cayma Koşulları</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg mb-4">Garanti</h3>
              <ul className="space-y-2">
                <li><a href="/garanti" className="text-muted-foreground hover:text-primary transition-colors">Sıfır Risk Garantisi</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg mb-4">İletişim</h3>
              <p className="text-muted-foreground">Uzay Demiral On3 Yazılım Hizmetleri</p>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-border/30">
            <p className="text-muted-foreground">© 2026 Sıçrama360™. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-sm border-t border-border/50 p-3 safe-bottom">
        <Button
          variant="hero"
          size="lg"
          onClick={scrollToPricing}
          className="w-full text-base font-bold"
        >
          Hemen Başla — 2.450 TL'den
        </Button>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        productId={PRODUCT_ID}
        productName={selectedTier.name}
        productPrice={selectedTier.price}
        tierId={selectedTier.id}
      />

      
      <CookieConsent />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
