import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [campaignEndDate, setCampaignEndDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaignEndDate = async () => {
      const { data, error } = await supabase
        .from("campaign_settings")
        .select("campaign_end_date, is_active")
        .eq("is_active", true)
        .single();

      if (!error && data) {
        setCampaignEndDate(data.campaign_end_date);
      }
    };

    fetchCampaignEndDate();
  }, []);

  useEffect(() => {
    if (!campaignEndDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(campaignEndDate) - +new Date();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    const timer = setInterval(() => {
      const time = calculateTimeLeft();
      if (time) {
        setTimeLeft(time);
        setIsExpired(false);
      } else {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [campaignEndDate]);

  if (!campaignEndDate) return null;
  
  if (isExpired) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive px-6 py-3 rounded-lg text-center animate-in fade-in">
        <p className="font-semibold">Kampanya Sona Erdi!</p>
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20 rounded-xl p-6 animate-in fade-in slide-in-from-top-5">
      <p className="text-center text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
        ⏰ Kampanya Bitiş Tarihi
      </p>
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-lg p-3 mb-2 font-bold text-2xl shadow-md">
            {timeLeft.days}
          </div>
          <p className="text-xs text-muted-foreground font-medium">Gün</p>
        </div>
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-lg p-3 mb-2 font-bold text-2xl shadow-md">
            {timeLeft.hours}
          </div>
          <p className="text-xs text-muted-foreground font-medium">Saat</p>
        </div>
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-lg p-3 mb-2 font-bold text-2xl shadow-md">
            {timeLeft.minutes}
          </div>
          <p className="text-xs text-muted-foreground font-medium">Dakika</p>
        </div>
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-lg p-3 mb-2 font-bold text-2xl shadow-md animate-pulse">
            {timeLeft.seconds}
          </div>
          <p className="text-xs text-muted-foreground font-medium">Saniye</p>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4 italic">
        Bu fırsatı kaçırmayın! ⚡
      </p>
    </div>
  );
};

export default CountdownTimer;
