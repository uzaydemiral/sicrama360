import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, Plus, X } from "lucide-react";
import { EmailTemplateManager } from "@/components/EmailTemplateManager";
import { DiscountCodeManager } from "@/components/DiscountCodeManager";
import { UpsellAnalytics } from "@/components/UpsellAnalytics";
import { StoreProductManager } from "@/components/StoreProductManager";

interface Product {
  id: string;
  name: string;
  primary_pdf_path: string | null;
  bonus_assets: Array<{ title: string; path: string }>;
  video_url: string | null;
}

interface BonusAsset {
  title: string;
  path: string;
  file?: File;
}

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [primaryPdfFile, setPrimaryPdfFile] = useState<File | null>(null);
  const [newBonuses, setNewBonuses] = useState<BonusAsset[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      setSelectedProduct(product || null);
      setNewBonuses([]);
      setPrimaryPdfFile(null);
    }
  }, [selectedProductId, products]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      await checkAdminRole(session.user.id);
      await loadProducts();
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

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, primary_pdf_path, bonus_assets, video_url")
      .order("name");

    if (error) {
      toast.error("Failed to load products");
      return;
    }

    const typedProducts: Product[] = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      primary_pdf_path: p.primary_pdf_path,
      bonus_assets: (p.bonus_assets as any) || [],
      video_url: p.video_url
    }));

    setProducts(typedProducts);
    if (typedProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(typedProducts[0].id);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    const response = await supabase.functions.invoke('upload-pdf', {
      body: formData,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data?.success) {
      throw new Error("Upload failed");
    }

    return response.data.path;
  };

  const deleteFile = async (path: string) => {
    if (!path) return;
    
    const normalizedPath = path.startsWith('workout-pdfs/')
      ? path.substring('workout-pdfs/'.length)
      : path;

    await supabase.storage
      .from("workout-pdfs")
      .remove([normalizedPath]);
  };

  const handleUploadPrimaryPdf = async () => {
    if (!primaryPdfFile || !selectedProduct) return;

    setUploading(true);
    try {
      // Delete old file if exists
      if (selectedProduct.primary_pdf_path) {
        await deleteFile(selectedProduct.primary_pdf_path);
      }

      // Upload new file
      const filePath = await uploadFile(primaryPdfFile);
      if (!filePath) {
        toast.error("File upload failed");
        return;
      }

      // Update database
      const { error } = await supabase
        .from("products")
        .update({ primary_pdf_path: filePath })
        .eq("id", selectedProduct.id);

      if (error) {
        toast.error("Failed to update product");
        return;
      }

      toast.success("Program PDF updated");
      setPrimaryPdfFile(null);
      await loadProducts();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePrimaryPdf = async () => {
    if (!selectedProduct?.primary_pdf_path) return;

    setUploading(true);
    try {
      await deleteFile(selectedProduct.primary_pdf_path);

      const { error } = await supabase
        .from("products")
        .update({ primary_pdf_path: null })
        .eq("id", selectedProduct.id);

      if (error) {
        toast.error("Failed to update product");
        return;
      }

      toast.success("Program PDF deleted");
      await loadProducts();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddBonusSlot = () => {
    setNewBonuses([...newBonuses, { title: "", path: "", file: undefined }]);
  };

  const handleRemoveBonusSlot = (index: number) => {
    setNewBonuses(newBonuses.filter((_, i) => i !== index));
  };

  const handleBonusChange = (index: number, field: 'title' | 'file', value: any) => {
    const updated = [...newBonuses];
    if (field === 'title') {
      updated[index].title = value;
    } else if (field === 'file') {
      updated[index].file = value;
    }
    setNewBonuses(updated);
  };

  const handleUploadBonuses = async () => {
    if (!selectedProduct || newBonuses.length === 0) return;

    setUploading(true);
    try {
      const uploadedBonuses: Array<{ title: string; path: string }> = [];

      for (const bonus of newBonuses) {
        if (!bonus.file || !bonus.title.trim()) continue;

        const filePath = await uploadFile(bonus.file);
        if (filePath) {
          uploadedBonuses.push({ title: bonus.title, path: filePath });
        }
      }

      if (uploadedBonuses.length === 0) {
        toast.error("No bonuses uploaded");
        return;
      }

      const existingBonuses = selectedProduct.bonus_assets || [];
      const allBonuses = [...existingBonuses, ...uploadedBonuses];

      const { error } = await supabase
        .from("products")
        .update({ bonus_assets: allBonuses })
        .eq("id", selectedProduct.id);

      if (error) {
        toast.error("Failed to update bonuses");
        return;
      }

      toast.success(`${uploadedBonuses.length} bonus(es) added`);
      setNewBonuses([]);
      await loadProducts();
    } catch (error) {
      console.error("Bonus upload error:", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBonus = async (index: number) => {
    if (!selectedProduct) return;

    setUploading(true);
    try {
      const bonuses = [...(selectedProduct.bonus_assets || [])];
      const bonusToDelete = bonuses[index];

      await deleteFile(bonusToDelete.path);
      bonuses.splice(index, 1);

      const { error } = await supabase
        .from("products")
        .update({ bonus_assets: bonuses })
        .eq("id", selectedProduct.id);

      if (error) {
        toast.error("Failed to delete bonus");
        return;
      }

      toast.success("Bonus deleted");
      await loadProducts();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
    } finally {
      setUploading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/orders")} variant="outline">
            Siparişler
          </Button>
          <Button onClick={handleSignOut} variant="outline">
            Çıkış Yap
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Product</CardTitle>
          <CardDescription>Choose a product to manage its files</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProduct && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Program PDF</CardTitle>
              <CardDescription>Main program file for {selectedProduct.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProduct.primary_pdf_path && (
                <div className="p-4 border rounded-lg flex justify-between items-center bg-muted">
                  <span className="text-sm font-mono truncate flex-1">
                    {selectedProduct.primary_pdf_path}
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeletePrimaryPdf}
                    disabled={uploading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label>Upload New Program PDF</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPrimaryPdfFile(e.target.files?.[0] || null)}
                />
                <Button
                  onClick={handleUploadPrimaryPdf}
                  disabled={!primaryPdfFile || uploading}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Program
                </Button>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle>Bonus Assets</CardTitle>
              <CardDescription>Additional downloadable content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProduct.bonus_assets && selectedProduct.bonus_assets.length > 0 && (
                <div className="space-y-2">
                  <Label>Existing Bonuses</Label>
                  {selectedProduct.bonus_assets.map((bonus, index) => (
                    <div key={index} className="p-4 border rounded-lg flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{bonus.title}</p>
                        <p className="text-sm text-muted-foreground font-mono truncate">{bonus.path}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteBonus(index)}
                        disabled={uploading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Add New Bonuses</Label>
                  <Button size="sm" variant="outline" onClick={handleAddBonusSlot}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bonus
                  </Button>
                </div>

                {newBonuses.map((bonus, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <Label>Bonus {index + 1}</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveBonusSlot(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Bonus title (e.g., Sıçrama Mekaniği Rehberi)"
                      value={bonus.title}
                      onChange={(e) => handleBonusChange(index, 'title', e.target.value)}
                    />
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleBonusChange(index, 'file', e.target.files?.[0])}
                    />
                  </div>
                ))}

                {newBonuses.length > 0 && (
                  <Button
                    onClick={handleUploadBonuses}
                    disabled={uploading || newBonuses.every(b => !b.file || !b.title.trim())}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload {newBonuses.length} Bonus(es)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <StoreProductManager />

          <UpsellAnalytics />

          <DiscountCodeManager />

          <EmailTemplateManager />
        </>
      )}
    </div>
  );
}
