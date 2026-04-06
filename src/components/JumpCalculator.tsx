import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CalculatorResult {
  currentJump: number;
  potentialImprovement: number;
  finalJump: number;
  category: string;
}

const JumpCalculator = () => {
  const [currentJump, setCurrentJump] = useState("");
  const [age, setAge] = useState("");
  const [experience, setExperience] = useState("");
  const [frequency, setFrequency] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculateImprovement = () => {
    const jump = parseInt(currentJump);
    const ageNum = parseInt(age);
    const exp = parseInt(experience);
    const freq = parseInt(frequency);

    if (!jump || !ageNum || !exp || !freq) return;

    // Temel gelişim potansiyeli hesaplama
    let baseImprovement = 15; // Ortalama 15cm gelişim

    // Yaşa göre düzenleme (genç sporcular daha fazla gelişir)
    if (ageNum < 18) baseImprovement += 5;
    else if (ageNum > 25) baseImprovement -= 3;

    // Deneyime göre düzenleme
    if (exp < 1) baseImprovement += 5; // Yeni başlayanlar hızlı gelişir
    else if (exp > 3) baseImprovement -= 2;

    // Antrenman sıklığına göre düzenleme
    if (freq >= 5) baseImprovement += 3;
    else if (freq < 3) baseImprovement -= 2;

    // Mevcut seviyeye göre düzenleme (düşük seviyedekiler daha fazla gelişir)
    if (jump < 50) baseImprovement += 5;
    else if (jump > 70) baseImprovement -= 3;

    const improvement = Math.max(8, Math.min(25, baseImprovement)); // 8-25cm arası
    const finalJump = jump + improvement;

    let category = "Başlangıç";
    if (jump >= 50 && jump < 65) category = "Orta";
    else if (jump >= 65) category = "İleri";

    setResult({
      currentJump: jump,
      potentialImprovement: improvement,
      finalJump,
      category,
    });
  };

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-5">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            🧮 Sıçrama Potansiyeli Hesaplayıcı
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mevcut durumunuzu girin, 90 gün sonra ne kadar gelişebileceğinizi öğrenin!
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <CardHeader>
            <CardTitle>Bilgilerinizi Girin</CardTitle>
            <CardDescription>Tüm alanları doldurun ve potansiyelinizi keşfedin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentJump">Mevcut Dikey Sıçrama (cm)</Label>
              <Input
                id="currentJump"
                type="number"
                placeholder="Örn: 55"
                value={currentJump}
                onChange={(e) => setCurrentJump(e.target.value)}
                min="20"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Yaşınız</Label>
              <Input
                id="age"
                type="number"
                placeholder="Örn: 18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="12"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Spor Deneyimi (yıl)</Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger id="experience">
                  <SelectValue placeholder="Seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0-1 yıl (Yeni başlayan)</SelectItem>
                  <SelectItem value="2">1-3 yıl</SelectItem>
                  <SelectItem value="4">3-5 yıl</SelectItem>
                  <SelectItem value="6">5+ yıl</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Haftalık Antrenman Sıklığı</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">1-2 gün</SelectItem>
                  <SelectItem value="3">3-4 gün</SelectItem>
                  <SelectItem value="5">5+ gün</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calculateImprovement} className="w-full" size="lg">
              Potansiyelimi Hesapla 🚀
            </Button>

            {result && (
              <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20 animate-in fade-in slide-in-from-bottom-3">
                <h3 className="text-2xl font-bold text-center mb-6">📊 Sonuçlarınız</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-background rounded">
                    <span className="font-medium">Mevcut Sıçrama:</span>
                    <span className="text-xl font-bold">{result.currentJump} cm</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded">
                    <span className="font-medium">Potansiyel Gelişim:</span>
                    <span className="text-xl font-bold text-primary">+{result.potentialImprovement} cm</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary text-primary-foreground rounded">
                    <span className="font-medium">Tahmini Final:</span>
                    <span className="text-2xl font-bold">{result.finalJump} cm 🎯</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded">
                    <span className="font-medium">Seviyeniz:</span>
                    <span className="text-lg font-bold">{result.category}</span>
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground mt-6 italic">
                  * Bu hesaplama tahminidir ve kişisel faktörlere göre değişebilir.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default JumpCalculator;
