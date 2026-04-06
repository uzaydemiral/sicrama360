import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

const WhatsAppButton = () => {
  const phoneNumber = "905072788880";
  const message = encodeURIComponent("Merhaba! Sıçrama360™ programı hakkında bilgi almak istiyorum.");
  
  const handleClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] p-0 shadow-lg hover:bg-[#20BA5A] hover:scale-110 transition-all duration-300 animate-pulse"
      aria-label="WhatsApp ile iletişime geç"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </Button>
  );
};

export default WhatsAppButton;
