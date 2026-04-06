-- Rename existing template and create tier-specific ones
UPDATE public.email_templates 
SET name = 'order_confirmation_elit' 
WHERE name = 'order_confirmation';

-- Create temel template (copy from elit, admin can customize later)
INSERT INTO public.email_templates (name, subject, html_content, text_content)
SELECT 'order_confirmation_temel', subject, html_content, text_content
FROM public.email_templates
WHERE name = 'order_confirmation_elit';

-- Create vip template (copy from elit, admin can customize later)
INSERT INTO public.email_templates (name, subject, html_content, text_content)
SELECT 'order_confirmation_vip', subject, html_content, text_content
FROM public.email_templates
WHERE name = 'order_confirmation_elit';