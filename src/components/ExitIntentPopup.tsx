import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, X } from "lucide-react";

interface ExitIntentPopupProps {
  onAccept: () => void;
}

export const ExitIntentPopup = ({ onAccept }: ExitIntentPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup has been shown in this session
    const shown = sessionStorage.getItem("scrollPopupShown");
    if (shown) {
      setHasShown(true);
      return;
    }

    // Only work on mobile devices
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      return;
    }

    const handleScroll = () => {
      if (hasShown || isOpen) return;

      // Calculate scroll percentage
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      // Show popup when user scrolls 60% of the page
      if (scrollPercent >= 60) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem("scrollPopupShown", "true");
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasShown, isOpen]);

  const handleAccept = () => {
    setIsOpen(false);
    onAccept();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg border-primary/50 bg-card">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="text-center space-y-3 pt-6">
          <DialogTitle className="font-display text-2xl md:text-3xl">
            Devam etmeden önce bilmeni istediğim bir şey var 👇
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-base md:text-lg font-semibold text-center">Bu sistemi tamamen risksiz deneyebilirsin.</p>

          <ul className="space-y-3 text-sm md:text-base">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1 font-bold">•</span>
              <span>
                30 günde gelişim olmazsa → <strong>Tam para iadesi</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1 font-bold">•</span>
              <span>
                90 günde +15 cm olmazsa → <strong>paranın 2 katı iade</strong> + hedef gerçekleşene kadar{" "}
                <strong>birebir koçluk</strong>.
              </span>
            </li>
          </ul>

          <div className="bg-primary/5 border border-primary/30 rounded-lg p-4 md:p-5 space-y-2">
            <p className="text-sm md:text-base font-semibold">Ayrıca:</p>
            <p className="text-sm md:text-base">
              Şu an kaydolmaktan vazgeçsen bile, hedeflerini doğru analiz etmek için sana{" "}
              <strong>ücretsiz kısa bir değerlendirme görüşmesi</strong> yapabilirim.
            </p>
          </div>

          <p className="text-center text-base md:text-lg font-display text-primary pt-2">
            Bu garantiyi kaçırmadan tekrar düşünmek ister misin?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleAccept} size="lg" className="w-full text-base">
            Programa Geri Dön
          </Button>
          <Button
            onClick={() => {
              window.open("https://cal.com/uzay-demiral13/analiz", "_blank");
              setIsOpen(false);
            }}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Ücretsiz Görüşme İste
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
