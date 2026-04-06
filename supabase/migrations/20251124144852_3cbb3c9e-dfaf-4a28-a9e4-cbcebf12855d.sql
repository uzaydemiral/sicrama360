-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admins can view all templates
CREATE POLICY "Admins can view email templates"
  ON public.email_templates
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert templates
CREATE POLICY "Admins can insert email templates"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update templates
CREATE POLICY "Admins can update email templates"
  ON public.email_templates
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete templates
CREATE POLICY "Admins can delete email templates"
  ON public.email_templates
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default template
INSERT INTO public.email_templates (name, subject, html_content, text_content)
VALUES (
  'order_confirmation',
  '90 Günde +15 cm Sıçrama Sistemine Hoş Geldin!',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>body{font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px;background:#0f0f0f}.container{background:#171717;border-radius:12px;padding:30px 20px}.logo{text-align:center;margin-bottom:20px}.logo h1{font-size:24px;font-weight:700;color:#FB5315;margin:0}.logo p{color:#999;font-size:11px;margin:5px 0 0;letter-spacing:2px;text-transform:uppercase}h2{color:#fff;font-size:22px;margin-bottom:15px;font-weight:700}h3{color:#FB5315;font-size:16px;margin:20px 0 10px;font-weight:600}p{color:#d4d4d4;margin:10px 0}a{color:#FB5315;text-decoration:none}.button{display:inline-block;background:#FB5315;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;margin:8px 0}ul{padding-left:20px;margin:10px 0}li{margin:8px 0;color:#d4d4d4}.guarantee{background:linear-gradient(135deg,#2a1810 0%,#1f1410 100%);border-radius:8px;padding:15px;margin:20px 0;border-left:4px solid #FB5315}.footer{margin-top:30px;padding-top:15px;border-top:2px solid #2a2a2a;color:#999;font-size:13px}</style></head><body><div class="container"><div class="logo"><h1>ATHLEVO</h1><p>by Thirteen Concept</p></div><h2>90 Günde +15 cm Sıçrama Sistemine Hoş Geldin!</h2><p>Merhaba {{customer_name}},</p><p>90 Günde +15 cm Sıçrama Sistemine katıldığın için tebrikler.</p><h3>1) Antrenman Programı</h3><p>{{program_link}}</p><h3>2) Progress Tracker</h3><p><a href="{{tracker_url}}" class="button">Progress Tracker''a Git</a></p><h3>3) Paket İçeriği</h3><ul><li>90 günlük antrenman sistemi</li><li>Sıçrama mekaniği masterclass</li><li>Diz ağrısı çözüm protokolü</li><li>Performans değerlendirmesi</li><li>Beslenme rehberi</li><li>Destek mesajları</li><li>Ritüel takip uygulaması</li></ul>{{bonus_section}}<div class="guarantee"><h3 style="margin:0 0 10px">Garanti</h3><p style="margin:0">30 günde gelişim yoksa → iade<br>90 günde +15 cm yoksa → 2x iade + 1-1 çalışma</p></div><p><strong>Programa sadık kal, antrenmanları aksatma.</strong></p><p>Sorular için: <a href="mailto:{{support_email}}">{{support_email}}</a></p><div class="footer"><p><strong>Uzay Demiral</strong><br>Athlevo / Thirteen Concept</p><p style="color:#666;font-size:12px;margin-top:15px">© 2025 Thirteen Concept</p></div></div></body></html>',
  '90 Günde +15 cm Sıçrama Sistemine Hoş Geldin!

Merhaba {{customer_name}},

90 Günde +15 cm Sıçrama Sistemine katıldığın için tebrikler.

1) Antrenman Programı
{{program_url}}

2) Progress Tracker
{{tracker_url}}

3) Paket İçeriği
- 90 günlük antrenman sistemi
- Sıçrama mekaniği masterclass
- Diz ağrısı çözüm protokolü
- Performans değerlendirmesi
- Beslenme rehberi
- Destek mesajları
- Ritüel takip uygulaması

{{bonus_text}}

Garanti:
30 günde gelişim yoksa → iade
90 günde +15 cm yoksa → 2x iade + 1-1 çalışma

Programa sadık kal, antrenmanları aksatma.

Sorular için: {{support_email}}

Uzay Demiral
Athlevo / Thirteen Concept'
);