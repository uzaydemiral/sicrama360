import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasConsented = localStorage.getItem("cookie-consent");
    if (!hasConsented) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-background/95 backdrop-blur-lg border border-border rounded-lg shadow-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-foreground mb-2">
                Bu site, deneyiminizi geliştirmek için çerezler kullanmaktadır.
              </p>
              <a 
                href="/gizlilik" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
              >
                Daha fazla bilgi için Gizlilik Politikamızı okuyun
              </a>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="flex-1 md:flex-none"
              >
                <X className="w-4 h-4 mr-2" />
                Kapat
              </Button>
              <Button
                onClick={handleAccept}
                size="sm"
                className="flex-1 md:flex-none"
              >
                Kabul Et
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
