import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    name: "",
    email: "",
    currentJump: "",
    experience: "",
    frequency: "",
    goal: "",
    tried: "",
    injury: "",
  });
  const [result, setResult] = useState<{ improvement: number; finalJump: number } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const questions = [
    {
      id: "currentJump",
      question: "Mevcut dikey sıçrama yüksekliğin kaç cm?",
      type: "input",
      placeholder: "Örn: 55",
    },
    {
      id: "experience",
      question: "Kaç yıldır düzenli spor yapıyorsun?",
      type: "radio",
      options: [
        { value: "0", label: "0-1 yıl" },
        { value: "2", label: "1-3 yıl" },
        { value: "4", label: "3-5 yıl" },
        { value: "6", label: "5+ yıl" },
      ],
    },
    {
      id: "frequency",
      question: "Haftada kaç gün antrenman yapıyorsun?",
      type: "radio",
      options: [
        { value: "2", label: "1-2 gün" },
        { value: "4", label: "3-4 gün" },
        { value: "6", label: "5+ gün" },
      ],
    },
    {
      id: "goal",
      question: "En büyük hedefin ne?",
      type: "radio",
      options: [
        { value: "dunk", label: "Smaç basmak 🏀" },
        { value: "performance", label: "Spor performansımı artırmak" },
        { value: "fitness", label: "Genel fitness ve atletizm" },
        { value: "compete", label: "Yarışmalarda başarılı olmak" },
      ],
    },
    {
      id: "tried",
      question: "Daha önce sıçrama programı denedin mi?",
      type: "radio",
      options: [
        { value: "no", label: "Hayır, ilk defa deneyeceğim" },
        { value: "yes-failed", label: "Evet ama başarılı olamadım" },
        { value: "yes-worked", label: "Evet ve işe yaradı" },
      ],
    },
    {
      id: "injury",
      question: "Diz veya ayak bileği probleminiz var mı?",
      type: "radio",
      options: [
        { value: "no", label: "Hayır, sağlığım iyi" },
        { value: "minor", label: "Küçük rahatsızlıklar var" },
        { value: "major", label: "Evet, ciddi problemim var" },
      ],
    },
  ];

  const handleNext = () => {
    const currentQuestion = questions[step];
    if (!answers[currentQuestion.id as keyof typeof answers]) {
      toast({
        title: "Lütfen soruyu cevaplayın",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const calculateResult = () => {
    const currentJump = parseInt(answers.currentJump);
    let improvement = 15; // Base improvement

    // Adjust based on experience
    const exp = parseInt(answers.experience);
    if (exp < 2) improvement += 5;
    else if (exp > 4) improvement -= 2;

    // Adjust based on frequency
    const freq = parseInt(answers.frequency);
    if (freq >= 5) improvement += 3;
    else if (freq < 3) improvement -= 2;

    // Adjust based on current level
    if (currentJump < 50) improvement += 5;
    else if (currentJump > 70) improvement -= 3;

    // Cap the improvement
    improvement = Math.max(8, Math.min(25, improvement));

    return {
      improvement,
      finalJump: currentJump + improvement,
    };
  };

  const handleSubmit = async () => {
    if (!answers.name || !answers.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) {
      toast({
        title: "Lütfen geçerli bilgilerinizi girin",
        description: "Ad ve geçerli bir e-posta adresi gereklidir.",
        variant: "destructive",
      });
      return;
    }

    const calculatedResult = calculateResult();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-quiz`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            name: answers.name,
            email: answers.email,
            answers: answers,
            currentJump: parseInt(answers.currentJump),
            potentialImprovement: calculatedResult.improvement,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gönderim başarısız oldu');
      }

      // Meta Pixel Lead Event
      window.fbq?.('track', 'Lead', {
        content_name: 'Sıçrama Testi',
        content_category: 'Quiz',
      });

      setResult(calculatedResult);
      toast({
        title: "🎉 Sonuçlarınız hazır!",
        description: "E-postanıza detaylı rapor gönderdik.",
      });
    } catch (error: any) {
      console.error("Error saving quiz result:", error);
      toast({
        title: "Hata",
        description: error.message || "Sonuçlar kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl mb-4">🎯 Sonuçlarınız Hazır!</CardTitle>
            <CardDescription className="text-lg">
              İşte 90 günlük Sıçrama360™ programı ile potansiyel gelişiminiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg flex justify-between items-center">
                <span className="font-medium">Mevcut Sıçrama:</span>
                <span className="text-2xl font-bold">{answers.currentJump} cm</span>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg flex justify-between items-center">
                <span className="font-medium">Potansiyel Gelişim:</span>
                <span className="text-2xl font-bold text-primary">+{result.improvement} cm</span>
              </div>
              <div className="p-6 bg-gradient-to-r from-primary to-primary/60 text-primary-foreground rounded-lg flex justify-between items-center">
                <span className="font-medium text-lg">Tahmini Final:</span>
                <span className="text-4xl font-bold">{result.finalJump} cm 🚀</span>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-lg">
              <p className="text-center font-medium mb-4">
                📧 Detaylı rapor <span className="text-primary font-bold">{answers.email}</span> adresinize gönderildi!
              </p>
              <p className="text-sm text-center text-muted-foreground">
                Raporunuzda sizin için özel öneriler ve antrenman tavsiyeleri bulunuyor.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate("/")} 
                size="lg" 
                className="w-full"
              >
                🏀 Programa Hemen Başla
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                size="lg" 
                variant="outline" 
                className="w-full"
              >
                🔄 Yeni Test Yap
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">📧 Son Adım!</CardTitle>
            <CardDescription className="text-lg">
              Sonuçlarınızı e-posta ile almak için bilgilerinizi girin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Adınız Soyadınız</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ahmet Yılmaz"
                value={answers.name}
                onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresiniz</Label>
              <Input
                id="email"
                type="email"
                placeholder="ahmet@example.com"
                value={answers.email}
                onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
              />
            </div>
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                🔒 E-posta adresiniz güvende. Sadece test sonuçlarınızı göndermek için kullanılacak.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handlePrevious} variant="outline" className="flex-1">
                Geri
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Sonuçları Gör 🚀
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Soru {step + 1} / {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(((step + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
          <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion.type === "input" ? (
            <Input
              type="number"
              placeholder={currentQuestion.placeholder}
              value={answers[currentQuestion.id as keyof typeof answers]}
              onChange={(e) =>
                setAnswers({ ...answers, [currentQuestion.id]: e.target.value })
              }
              className="text-lg"
            />
          ) : (
            <RadioGroup
              value={answers[currentQuestion.id as keyof typeof answers]}
              onValueChange={(value) =>
                setAnswers({ ...answers, [currentQuestion.id]: value })
              }
            >
              {currentQuestion.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer text-base">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <Button onClick={handlePrevious} variant="outline" className="flex-1">
                Geri
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {step === questions.length - 1 ? "Devam" : "İleri"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
