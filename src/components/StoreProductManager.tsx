import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, GripVertical, X, ImageIcon } from "lucide-react";

interface StoreProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cover_image_url: string | null;
  features: string[];
  target_audience: string | null;
  badge: string | null;
  is_active: boolean;
  display_order: number;
}

export const StoreProductManager = () => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const emptyProduct: StoreProduct = {
    id: "",
    name: "",
    description: "",
    price: 0,
    cover_image_url: null,
    features: [""],
    target_audience: "",
    badge: "",
    is_active: true,
    display_order: 0,
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    // Use type assertion since store_products is a new table
    const { data, error } = await (supabase as any)
      .from("store_products")
      .select("*")
      .order("display_order");

    if (error) {
      toast.error("Ürünler yüklenemedi");
      setLoading(false);
      return;
    }

    setProducts(
      (data || []).map((p: any) => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : [],
      }))
    );
    setLoading(false);
  };

  const handleEdit = (product: StoreProduct) => {
    setEditingProduct({ ...product, features: product.features.length ? product.features : [""] });
    setImagePreview(product.cover_image_url);
    setImageFile(null);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingProduct({ ...emptyProduct, display_order: products.length });
    setImagePreview(null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) throw error;

    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!editingProduct || !editingProduct.name.trim() || editingProduct.price <= 0) {
      toast.error("Ad ve fiyat zorunludur");
      return;
    }

    setSaving(true);
    try {
      let coverUrl = editingProduct.cover_image_url;

      if (imageFile) {
        coverUrl = await uploadImage(imageFile);
      }

      const payload = {
        name: editingProduct.name.trim(),
        description: editingProduct.description?.trim() || null,
        price: editingProduct.price,
        cover_image_url: coverUrl,
        features: editingProduct.features.filter((f) => f.trim()),
        target_audience: editingProduct.target_audience?.trim() || null,
        badge: editingProduct.badge?.trim() || null,
        is_active: editingProduct.is_active,
        display_order: editingProduct.display_order,
      };

      if (editingProduct.id) {
        const { error } = await (supabase as any)
          .from("store_products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;
        toast.success("Ürün güncellendi");
      } else {
        const { error } = await (supabase as any)
          .from("store_products")
          .insert(payload);
        if (error) throw error;
        toast.success("Ürün eklendi");
      }

      setShowForm(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Kaydetme hatası: " + (error.message || "Bilinmeyen hata"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
      const { error } = await (supabase as any)
        .from("store_products")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Ürün silindi");
      await loadProducts();
    } catch (error: any) {
      toast.error("Silme hatası: " + error.message);
    }
  };

  const updateFeature = (index: number, value: string) => {
    if (!editingProduct) return;
    const features = [...editingProduct.features];
    features[index] = value;
    setEditingProduct({ ...editingProduct, features });
  };

  const addFeature = () => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, features: [...editingProduct.features, ""] });
  };

  const removeFeature = (index: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      features: editingProduct.features.filter((_, i) => i !== index),
    });
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mağaza Ürünleri</CardTitle>
        <Button size="sm" onClick={handleNew}>
          <Plus className="h-4 w-4 mr-1" />
          Yeni Ürün
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product list */}
        {products.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Henüz mağaza ürünü eklenmemiş.
          </p>
        )}

        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-3 border rounded-lg"
          >
            {product.cover_image_url ? (
              <img src={product.cover_image_url} alt={product.name} className="w-12 h-12 rounded object-cover" />
            ) : (
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {product.price.toLocaleString("tr-TR")} TL
                {!product.is_active && " • Pasif"}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
              Düzenle
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Edit/New form */}
        {showForm && editingProduct && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{editingProduct.id ? "Ürünü Düzenle" : "Yeni Ürün"}</h4>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditingProduct(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ürün Adı *</Label>
                <Input
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Sıçrama Programı"
                />
              </div>
              <div className="space-y-2">
                <Label>Fiyat (TL) *</Label>
                <Input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={editingProduct.description || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                placeholder="Kısa açıklama"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Hedef Kitle</Label>
              <Input
                value={editingProduct.target_audience || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, target_audience: e.target.value })}
                placeholder="Kendi başına çalışmayı seven sporcular için"
              />
            </div>

            <div className="space-y-2">
              <Label>Rozet (Badge)</Label>
              <Input
                value={editingProduct.badge || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                placeholder="EN ÇOK TERCİH EDİLEN"
              />
            </div>

            <div className="space-y-2">
              <Label>Sıralama</Label>
              <Input
                type="number"
                value={editingProduct.display_order}
                onChange={(e) => setEditingProduct({ ...editingProduct, display_order: Number(e.target.value) })}
              />
            </div>

            {/* Cover image */}
            <div className="space-y-2">
              <Label>Kapak Görseli</Label>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-lg object-cover" />
              )}
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Özellikler</Label>
                <Button type="button" size="sm" variant="outline" onClick={addFeature}>
                  <Plus className="h-3 w-3 mr-1" />
                  Ekle
                </Button>
              </div>
              {editingProduct.features.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={f}
                    onChange={(e) => updateFeature(i, e.target.value)}
                    placeholder="Özellik"
                  />
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeFeature(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={editingProduct.is_active}
                onCheckedChange={(val) => setEditingProduct({ ...editingProduct, is_active: val })}
              />
              <Label>Aktif</Label>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingProduct.id ? "Güncelle" : "Ekle"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
