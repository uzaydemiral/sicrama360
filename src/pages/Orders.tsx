import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  payment_status: string;
  tier: string;
  created_at: string;
}

export default function Orders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      await checkAdminRole(session.user.id);
      await loadOrders();
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const checkAdminRole = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const response = await supabase.functions.invoke('check-admin', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error || !response.data?.isAdmin) {
        console.error("Admin check failed:", response.error);
        toast.error("Yetkisiz erişim - Admin rolü gerekli");
        navigate("/");
      }
    } catch (error) {
      console.error("Admin role check failed:", error);
      toast.error("Yetki kontrolünde hata");
      navigate("/");
    }
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, amount, payment_status, tier, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      toast.error("Failed to load orders");
      console.error(error);
      return;
    }

    setOrders(data || []);
  };

  const handleResendEmail = async (orderId: string) => {
    setResendingId(orderId);
    try {
      const { data, error } = await supabase.functions.invoke('resend-order-email', {
        body: { orderId },
      });

      if (error) {
        throw new Error("E-posta gönderilemedi");
      }

      toast.success("E-posta başarıyla gönderildi");
    } catch (error: any) {
      console.error("Error resending email:", error);
      toast.error(error.message || "E-posta gönderilirken hata oluştu");
    } finally {
      setResendingId(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Siparişler</h1>
          <p className="text-muted-foreground">Son 20 sipariş</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/admin")} variant="outline">
            Ürün Yönetimi
          </Button>
          <Button onClick={handleSignOut} variant="outline">
            Çıkış Yap
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sipariş Listesi</CardTitle>
          <CardDescription>Tüm siparişleri ve durumlarını görüntüleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(order.created_at), "dd.MM.yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium">{order.customer_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.customer_email}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {order.amount.toFixed(2)} ₺
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.tier === "temel" ? "Temel" : order.tier === "elit" ? "Elit" : order.tier === "vip" ? "Ultra VIP" : order.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.payment_status === "completed"
                          ? "default"
                          : order.payment_status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {order.payment_status === "completed"
                        ? "Tamamlandı"
                        : order.payment_status === "pending"
                        ? "Bekliyor"
                        : "İptal"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {order.payment_status === "completed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResendEmail(order.id)}
                        disabled={resendingId === order.id}
                      >
                        {resendingId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            E-postayı Gönder
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Henüz sipariş bulunmuyor
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
