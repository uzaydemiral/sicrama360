import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Tag } from "lucide-react";

interface DiscountCode {
  id: string;
  code: string;
  type: string;
  value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export function DiscountCodeManager() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 0,
    max_uses: null as number | null,
    expires_at: "",
    is_active: true,
  });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("discount_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error("Error loading discount codes:", error);
      toast.error("İndirim kodları yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (code?: DiscountCode) => {
    if (code) {
      setEditingCode(code);
      setFormData({
        code: code.code,
        type: code.type as "percent" | "fixed",
        value: Number(code.value),
        max_uses: code.max_uses,
        expires_at: code.expires_at ? new Date(code.expires_at).toISOString().slice(0, 16) : "",
        is_active: code.is_active,
      });
    } else {
      setEditingCode(null);
      setFormData({
        code: "",
        type: "percent",
        value: 0,
        max_uses: null,
        expires_at: "",
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCode(null);
    setFormData({
      code: "",
      type: "percent",
      value: 0,
      max_uses: null,
      expires_at: "",
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("Kod giriniz");
      return;
    }

    if (formData.value <= 0) {
      toast.error("Değer sıfırdan büyük olmalı");
      return;
    }

    if (formData.type === "percent" && formData.value > 100) {
      toast.error("Yüzde değeri 100'den büyük olamaz");
      return;
    }

    try {
      const codeData = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: formData.value,
        max_uses: formData.max_uses || null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        is_active: formData.is_active,
      };

      if (editingCode) {
        // Update existing code
        const { error } = await supabase
          .from("discount_codes")
          .update(codeData)
          .eq("id", editingCode.id);

        if (error) throw error;
        toast.success("İndirim kodu güncellendi");
      } else {
        // Create new code
        const { error } = await supabase
          .from("discount_codes")
          .insert(codeData);

        if (error) {
          if (error.code === "23505") {
            toast.error("Bu kod zaten mevcut");
          } else {
            throw error;
          }
          return;
        }
        toast.success("İndirim kodu oluşturuldu");
      }

      handleCloseDialog();
      loadCodes();
    } catch (error) {
      console.error("Error saving discount code:", error);
      toast.error("İndirim kodu kaydedilemedi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu indirim kodunu silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("discount_codes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("İndirim kodu silindi");
      loadCodes();
    } catch (error) {
      console.error("Error deleting discount code:", error);
      toast.error("İndirim kodu silinemedi");
    }
  };

  const handleToggleActive = async (code: DiscountCode) => {
    try {
      const { error } = await supabase
        .from("discount_codes")
        .update({ is_active: !code.is_active })
        .eq("id", code.id);

      if (error) throw error;
      toast.success(code.is_active ? "Kod devre dışı bırakıldı" : "Kod aktif edildi");
      loadCodes();
    } catch (error) {
      console.error("Error toggling discount code:", error);
      toast.error("Durum değiştirilemedi");
    }
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              İndirim Kodları
            </CardTitle>
            <CardDescription>İndirim kodlarını oluşturun ve yönetin</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kod
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCode ? "İndirim Kodunu Düzenle" : "Yeni İndirim Kodu"}
                </DialogTitle>
                <DialogDescription>
                  İndirim kodu bilgilerini girin
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kod *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="ATHLEVO20"
                    maxLength={50}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">İndirim Tipi *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "percent" | "fixed") => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Yüzde (%)</SelectItem>
                      <SelectItem value="fixed">Sabit Tutar (₺)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">
                    {formData.type === "percent" ? "Yüzde Değeri" : "Tutar (₺)"} *
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    placeholder={formData.type === "percent" ? "20" : "100"}
                    min="0"
                    max={formData.type === "percent" ? "100" : undefined}
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_uses">Maksimum Kullanım</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses || ""}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Limitsiz"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">Boş bırakırsanız sınırsız olur</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires_at">Son Kullanma Tarihi</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Boş bırakırsanız süresiz olur</p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Aktif</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                    İptal
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingCode ? "Güncelle" : "Oluştur"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {codes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz indirim kodu oluşturulmamış
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kod</TableHead>
                  <TableHead>İndirim</TableHead>
                  <TableHead>Kullanım</TableHead>
                  <TableHead>Bitiş</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono font-semibold">{code.code}</TableCell>
                    <TableCell>
                      {code.type === "percent" ? `%${code.value}` : `${code.value}₺`}
                    </TableCell>
                    <TableCell>
                      {code.current_uses}
                      {code.max_uses && ` / ${code.max_uses}`}
                    </TableCell>
                    <TableCell>
                      {code.expires_at ? (
                        <span className="text-xs">
                          {new Date(code.expires_at).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Süresiz</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={code.is_active ? "default" : "secondary"}>
                        {code.is_active ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(code)}
                          title={code.is_active ? "Devre dışı bırak" : "Aktif et"}
                        >
                          <Switch checked={code.is_active} className="pointer-events-none" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(code)}
                          title="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(code.id)}
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
