import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Max-Age": "86400",
};

const resendEmailSchema = z.object({
  orderId: z.string().uuid(),
});

/** Send email via Gmail SMTP using raw socket — no third-party library */
async function sendEmailSmtp(options: {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
}) {
  const { host, port, username, password, from, to, subject, textBody, htmlBody } = options;

  const conn = await Deno.connectTls({ hostname: host, port });
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  async function read(): Promise<string> {
    const buf = new Uint8Array(4096);
    const n = await conn.read(buf);
    return n ? decoder.decode(buf.subarray(0, n)) : "";
  }

  async function write(data: string) {
    await conn.write(encoder.encode(data + "\r\n"));
  }

  async function command(cmd: string): Promise<string> {
    await write(cmd);
    return await read();
  }

  // Read greeting
  await read();

  await command("EHLO localhost");

  // AUTH LOGIN
  await command("AUTH LOGIN");
  await command(btoa(username));
  await command(btoa(password));

  await command(`MAIL FROM:<${from.replace(/.*</, "").replace(/>.*/, "")}>`);
  await command(`RCPT TO:<${to}>`);
  await command("DATA");

  const boundary = "----=_Part_" + crypto.randomUUID().replace(/-/g, "");

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    textBody,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    htmlBody,
    ``,
    `--${boundary}--`,
    `.`,
  ].join("\r\n");

  await conn.write(encoder.encode(message + "\r\n"));
  await read();

  await command("QUIT");
  conn.close();
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const validatedData = resendEmailSchema.parse(body);

    console.log("Loading order...");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        customer_name,
        customer_email,
        amount,
        payment_status,
        access_token,
        tier,
        products!inner (
          name,
          title,
          primary_pdf_path,
          bonus_assets
        )
      `)
      .eq("id", validatedData.orderId)
      .eq("payment_status", "completed")
      .single();

    if (orderError || !order) {
      console.error("Order not found or not completed:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found or not completed" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!order.access_token) {
      console.error("Order missing access token");
      return new Response(
        JSON.stringify({ error: "Invalid order configuration" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const product = Array.isArray(order.products) ? order.products[0] : order.products;
    const oidWithoutHyphens = order.id.replace(/-/g, '');

    const orderTier = (order as any).tier || 'elit';
    const templateName = `order_confirmation_${orderTier}`;
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', templateName)
      .single();

    if (!template) {
      console.error("Email template not found for tier:", orderTier);
      return new Response(JSON.stringify({ error: "Template not found" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trackerUrl = "https://athlevoprogresstracker.lovable.app";
    const supportEmail = "uzaydemiral@thirteenconcept.com";

    // Thank-you page link (never expires)
    const thankYouPageUrl = `https://jump.thirteenconcept.com/tesekkurler?oid=${oidWithoutHyphens}&token=${encodeURIComponent(order.access_token)}`;

    // Also generate direct signed URLs (7 days) for convenience
    const signedUrls: Array<{ name: string; url: string }> = [];
    const bonusUrls: Array<{ title: string; url: string }> = [];

    // Yem tier: no digital program, only guides
    if (orderTier !== 'yem' && product?.primary_pdf_path) {
      const normalizedPath = product.primary_pdf_path.startsWith('workout-pdfs/')
        ? product.primary_pdf_path.substring('workout-pdfs/'.length)
        : product.primary_pdf_path;

      const { data: signedData } = await supabase.storage
        .from("workout-pdfs")
        .createSignedUrl(normalizedPath, 604800); // 7 days

      if (signedData?.signedUrl) {
        signedUrls.push({
          name: product.title || product.name || "Ana Program",
          url: signedData.signedUrl,
        });
      }
    }

    const rawBonusAssets = Array.isArray(product?.bonus_assets) ? product.bonus_assets : [];
    const bonusAssetsToUse = orderTier === 'temel' ? [] : rawBonusAssets;

    for (const bonus of bonusAssetsToUse) {
      if ((bonus as any).path) {
        const normalizedPath = (bonus as any).path.startsWith('workout-pdfs/')
          ? (bonus as any).path.substring('workout-pdfs/'.length)
          : (bonus as any).path;

        const { data: signedData } = await supabase.storage
          .from("workout-pdfs")
          .createSignedUrl(normalizedPath, 604800); // 7 days

        if (signedData?.signedUrl) {
          bonusUrls.push({
            title: (bonus as any).title || "Bonus",
            url: signedData.signedUrl,
          });
        }
      }
    }

    const mainProgramUrl = signedUrls.length > 0 ? signedUrls[0].url : thankYouPageUrl;

    // Program link: direct PDF + fallback to thank-you page
    const programLink = signedUrls.length > 0
      ? `<a href="${signedUrls[0].url}" class="button">Programi Indir</a><br><p style="font-size:12px;color:#888;margin-top:8px;">Link 7 gun gecerlidir. Suresi dolduysa <a href="${thankYouPageUrl}">buraya tiklayarak</a> tekrar indirebilirsiniz.</p>`
      : `<a href="${thankYouPageUrl}" class="button">Programi Indir</a>`;

    // Bonus section with direct links + fallback
    const bonusSection = bonusUrls.length > 0 
      ? `<h3>Bonuslar</h3>${bonusUrls.map(b => `<p><a href="${b.url}">${b.title}</a></p>`).join('')}<p style="font-size:12px;color:#888;">Bonus linkleri 7 gun gecerlidir. Suresi dolduysa <a href="${thankYouPageUrl}">indirme sayfanizi</a> kullanin.</p>`
      : '';

    const bonusText = bonusUrls.length > 0 
      ? `Bonuslar:\n${bonusUrls.map(b => `- ${b.title}: ${b.url}`).join('\n')}\n(Linklerin suresi dolduysa: ${thankYouPageUrl})`
      : '';

    const emailHtml = template.html_content
      .replace(/\{\{customer_name\}\}/g, order.customer_name)
      .replace(/\{\{program_link\}\}/g, programLink)
      .replace(/\{\{tracker_url\}\}/g, trackerUrl)
      .replace(/\{\{bonus_section\}\}/g, bonusSection)
      .replace(/\{\{support_email\}\}/g, supportEmail);

    const emailText = template.text_content
      .replace(/\{\{customer_name\}\}/g, order.customer_name)
      .replace(/\{\{program_url\}\}/g, mainProgramUrl || 'Program linki hazırlanıyor...')
      .replace(/\{\{tracker_url\}\}/g, trackerUrl)
      .replace(/\{\{bonus_text\}\}/g, bonusText)
      .replace(/\{\{support_email\}\}/g, supportEmail);

    await sendEmailSmtp({
      host: Deno.env.get("SMTP_HOST") || "smtp.gmail.com",
      port: Number(Deno.env.get("SMTP_PORT")) || 465,
      username: Deno.env.get("SMTP_USER") || "",
      password: Deno.env.get("SMTP_PASS") || "",
      from: Deno.env.get("SMTP_FROM") || "Athlevo <demiral.uzay@gmail.com>",
      to: order.customer_email,
      subject: template.subject,
      textBody: emailText,
      htmlBody: emailHtml,
    });

    console.log("Email sent successfully to:", order.customer_email);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in resend-order-email:", error);
    
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});