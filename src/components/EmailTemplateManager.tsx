import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const TEMPLATE_LABELS: Record<string, string> = {
  order_confirmation_temel: "📦 Temel Paket - Sipariş Onayı",
  order_confirmation_elit: "🚀 Elit Uçuş Sistemi - Sipariş Onayı",
  order_confirmation_vip: "⭐ Ultra VIP - Sipariş Onayı",
};

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
}

export function EmailTemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(template || null);
    }
  }, [selectedTemplateId, templates]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("name");

      if (error) throw error;

      setTemplates(data || []);
      if (data && data.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Şablonlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject: selectedTemplate.subject,
          html_content: selectedTemplate.html_content,
          text_content: selectedTemplate.text_content,
        })
        .eq("id", selectedTemplate.id);

      if (error) throw error;

      toast.success("Şablon kaydedildi");
      await loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Şablon kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof EmailTemplate, value: string) => {
    if (!selectedTemplate) return;
    setSelectedTemplate({ ...selectedTemplate, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>E-posta Şablonları</CardTitle>
        <CardDescription>
          Müşterilere gönderilen e-posta şablonlarını düzenleyin. Değişkenler: {"{"}customer_name{"}"}, {"{"}program_link{"}"}, {"{"}tracker_url{"}"}, {"{"}bonus_section{"}"}, {"{"}support_email{"}"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Şablon Seç</Label>
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Şablon seçin" />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {TEMPLATE_LABELS[template.name] || template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTemplate && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Konu</Label>
              <Input
                value={selectedTemplate.subject}
                onChange={(e) => handleFieldChange("subject", e.target.value)}
                placeholder="E-posta konusu"
              />
            </div>

            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="html">HTML İçerik</TabsTrigger>
                <TabsTrigger value="text">Metin İçerik</TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="space-y-2">
                <Label>HTML İçerik</Label>
                <Textarea
                  value={selectedTemplate.html_content}
                  onChange={(e) => handleFieldChange("html_content", e.target.value)}
                  placeholder="HTML e-posta içeriği"
                  className="font-mono text-xs min-h-[400px]"
                />
              </TabsContent>
              <TabsContent value="text" className="space-y-2">
                <Label>Metin İçerik</Label>
                <Textarea
                  value={selectedTemplate.text_content}
                  onChange={(e) => handleFieldChange("text_content", e.target.value)}
                  placeholder="Düz metin e-posta içeriği"
                  className="font-mono text-xs min-h-[400px]"
                />
              </TabsContent>
            </Tabs>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Şablonu Kaydet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
