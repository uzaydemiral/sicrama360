-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age TEXT NOT NULL,
  sport TEXT NOT NULL,
  before_cm INTEGER NOT NULL,
  after_cm INTEGER NOT NULL,
  improvement_cm INTEGER GENERATED ALWAYS AS (after_cm - before_cm) STORED,
  quote TEXT NOT NULL,
  weeks_completed TEXT NOT NULL,
  video_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create program_stats table for the animated counter
CREATE TABLE public.program_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_athletes INTEGER NOT NULL DEFAULT 0,
  total_cm_gained INTEGER NOT NULL DEFAULT 0,
  average_improvement NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for testimonials
CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can insert testimonials"
ON public.testimonials
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update testimonials"
ON public.testimonials
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete testimonials"
ON public.testimonials
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for program_stats
CREATE POLICY "Anyone can view program stats"
ON public.program_stats
FOR SELECT
USING (true);

CREATE POLICY "Admins can update program stats"
ON public.program_stats
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on testimonials
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on program_stats
CREATE TRIGGER update_program_stats_updated_at
BEFORE UPDATE ON public.program_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial sample testimonials
INSERT INTO public.testimonials (name, age, sport, before_cm, after_cm, quote, weeks_completed, video_url, is_featured, display_order, is_active) VALUES
('Ege K.', '16', 'Basketbol - Guard', 58, 72, 'İlk 4 haftada bile farkı hissettim. Artık sadece sıçramıyorum, daha kontrollü iniyorum ve dizlerim hiç ağrımıyor.', '12 hafta', NULL, true, 1, true),
('Berk Y.', '17', 'Voleybol - Smaçör', 62, 75, 'Program sayesinde blok yüksekliğim arttı. En önemlisi programın her haftası planlanmış, ne yapacağım belli.', '10 hafta', NULL, true, 2, true),
('Alp M.', '15', 'Basketbol - Forward', 54, 66, 'Evde çalışıyordum ve gelişim görmüyordum. Bu sistemle haftalık test yapınca motivasyonum çok arttı.', '12 hafta', NULL, true, 3, true),
('Kaan S.', '16', 'Basketbol - Center', 60, 74, 'Diz ağrım vardı ve çalışmaya korkuyordum. Protokol sayesinde hem ağrım geçti hem de sıçramam gelişti.', '11 hafta', NULL, true, 4, true),
('Mert D.', '17', 'Voleybol - Libero', 56, 68, 'Her hafta check-in yaptım ve formumu düzelttiler. Tek başıma yaparken bu desteği bulamıyordum.', '12 hafta', NULL, true, 5, true),
('Can T.', '15', 'Basketbol - Guard', 52, 66, 'İlk defa sistematik çalışıyorum. Haftalık planlar ve videolar sayesinde her şey çok net.', '12 hafta', NULL, true, 6, true),
('Mehmet A.', '16', 'Basketbol U16', 55, 70, 'Video testimonialde anlattığım gibi, sadece sıçrama değil genel atletik performansım da arttı.', '12 hafta', 'https://youtu.be/dQw4w9WgXcQ', true, 7, true),
('Emre K.', '17', 'Voleybol U17', 60, 73, 'Check-in sistemini çok sevdim. Her hafta gelişimimi görmek inanılmaz motiveydi.', '11 hafta', 'https://youtu.be/dQw4w9WgXcQ', true, 8, true);

-- Insert initial program stats
INSERT INTO public.program_stats (total_athletes, total_cm_gained, average_improvement) VALUES
(1247, 15892, 12.7);