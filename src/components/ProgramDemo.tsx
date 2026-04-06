import programDemo1 from "@/assets/program-demo-1.png";
import programDemo2 from "@/assets/program-demo-2.png";
import { Card } from "./ui/card";

const ProgramDemo = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-5">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            📱 Program İçeriğine Bir Göz Atın
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            İşte sizi içeride bekleyen profesyonel program içeriği. Her hafta detaylı video anlatımlı egzersizler!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-left-5">
            <div className="relative">
              <img 
                src={programDemo1} 
                alt="Sıçrama360 Program Demo - Haftalık Egzersizler" 
                className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-semibold text-lg">
                  🎯 Haftalık Egzersiz Programları
                </p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-right-5">
            <div className="relative">
              <img 
                src={programDemo2} 
                alt="Sıçrama360 Program Demo - Detaylı Antrenman İçeriği" 
                className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-semibold text-lg">
                  📋 Detaylı Antrenman Listesi
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-5">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
            <span className="text-2xl">✓</span>
            <p className="text-sm font-semibold">Her egzersiz için video anlatım</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full ml-3">
            <span className="text-2xl">✓</span>
            <p className="text-sm font-semibold">Set ve tekrar sayıları belirtilmiş</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
            <span className="text-2xl">✓</span>
            <p className="text-sm font-semibold">12 hafta boyunca günlük takip</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgramDemo;
