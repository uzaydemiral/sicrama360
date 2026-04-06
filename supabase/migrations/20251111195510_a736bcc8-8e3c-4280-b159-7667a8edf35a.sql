-- Add new fields to products table for enhanced delivery experience
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS primary_pdf_path text,
ADD COLUMN IF NOT EXISTS bonus_assets jsonb DEFAULT '[]'::jsonb;

-- Update existing product with sample data
UPDATE public.products 
SET 
  slug = 'sicrama360',
  title = 'Sıçrama360™ - Basketbolcular için 90 Günde +15 cm Sıçrama Sistemi',
  primary_pdf_path = (SELECT pdf_url FROM public.products LIMIT 1),
  bonus_assets = '[
    {"title": "Gelişim Takip Tablosu", "path": "gelisim-takip.xlsx"},
    {"title": "Altyapı Sporcuları için Beslenme Rehberi", "path": "beslenme.pdf"},
    {"title": "Diz Ağrısı Çözüm Protokolü", "path": "diz-protokol.pdf"},
    {"title": "Performans Sağlığı Değerlendirmesi", "path": "performans-sagligi.pdf"},
    {"title": "Sıçrama Mekaniği Rehberi (10 dk)", "path": "mekanik-10dk.pdf"},
    {"title": "Sıçrama Ölçüm Kitapçığı", "path": "olcum.pdf"},
    {"title": "Sakatlıktan Dönüş Rehberi", "path": "sakatlik-donus.pdf"}
  ]'::jsonb
WHERE id = (SELECT id FROM public.products LIMIT 1);