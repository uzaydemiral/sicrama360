import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, Eye, CheckCircle, XCircle } from "lucide-react";

interface UpsellStats {
  totalViews: number;
  totalAccepts: number;
  totalDeclines: number;
  acceptanceRate: number;
  totalRevenue: number;
}

export const UpsellAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UpsellStats>({
    totalViews: 0,
    totalAccepts: 0,
    totalDeclines: 0,
    acceptanceRate: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from("upsell_events")
        .select("event_type, upsell_price");

      if (error) {
        console.error("Failed to load upsell stats:", error);
        return;
      }

      const views = data?.filter(e => e.event_type === "view").length || 0;
      const accepts = data?.filter(e => e.event_type === "accept") || [];
      const declines = data?.filter(e => e.event_type === "decline").length || 0;

      const totalRevenue = accepts.reduce((sum, e) => sum + (Number(e.upsell_price) || 0), 0);
      const acceptanceRate = views > 0 ? (accepts.length / views) * 100 : 0;

      setStats({
        totalViews: views,
        totalAccepts: accepts.length,
        totalDeclines: declines,
        acceptanceRate: Math.round(acceptanceRate * 10) / 10,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Upsell Analitikleri
        </CardTitle>
        <CardDescription>
          Yüksek Performans Kiti teklif istatistikleri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.totalViews}</p>
            <p className="text-sm text-muted-foreground">Görüntülenme</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{stats.totalAccepts}</p>
            <p className="text-sm text-muted-foreground">Kabul</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <XCircle className="h-5 w-5 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{stats.totalDeclines}</p>
            <p className="text-sm text-muted-foreground">Red</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">{stats.acceptanceRate}%</p>
            <p className="text-sm text-muted-foreground">Kabul Oranı</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
          <p className="text-sm text-muted-foreground mb-1">Toplam Upsell Geliri</p>
          <p className="text-3xl font-bold text-primary">
            {stats.totalRevenue.toLocaleString('tr-TR')} TL
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
