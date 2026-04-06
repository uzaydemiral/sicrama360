import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const allowedOrigins = [
  "https://jump.thirteenconcept.com",
  "https://jump-boost-90-main-2.vercel.app",
  "https://sicramanigelistir.lovable.app",
  "https://shop.thirteenconcept.com",
  "http://localhost:5173",
  "http://localhost:8080"
];

function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

// Simple in-memory rate limiting (resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count++;
  return true;
}

serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const oidParam = url.searchParams.get("oid") || url.searchParams.get("order_id");
    const token = url.searchParams.get("token");

    if (!oidParam) {
      return new Response(
        JSON.stringify({ error: "Order ID (oid) is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Access token is required" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Rate limiting by oid
    if (!checkRateLimit(oidParam)) {
      console.log("Rate limit exceeded for oid:", oidParam);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "60"
          } 
        }
      );
    }

    // Convert hyphen-less oid to UUID format if needed
    let orderId = oidParam;
    if (!oidParam.includes("-") && oidParam.length === 32) {
      orderId = oidParam.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    }

    console.log("Fetching order:", orderId);

    // Fetch order with product details and access token (support both pending and completed)
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        customer_name,
        customer_email,
        amount,
        payment_status,
        access_token,
        token_expires_at,
        tier,
        products!inner (
          name,
          title,
          pdf_url,
          primary_pdf_path,
          bonus_assets
        )
      `)
      .eq("id", orderId)
      .single();

    if (error || !data) {
      console.error("Error fetching order:", error);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Verify access token
    if (data.access_token !== token) {
      console.error("Invalid access token");
      return new Response(
        JSON.stringify({ error: "Invalid access token" }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Auto-extend expired tokens instead of blocking access
    if (data.token_expires_at && new Date(data.token_expires_at) < new Date()) {
      const newExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      await supabase
        .from("orders")
        .update({ token_expires_at: newExpiry.toISOString() })
        .eq("id", orderId);
      console.log("Auto-extended expired token for order:", orderId);
    }

    const product = Array.isArray(data.products) ? data.products[0] : data.products;

    // If payment is still pending
    if (data.payment_status === "pending") {
      return new Response(
        JSON.stringify({
          status: "pending",
          id: data.id,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          amount: data.amount,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Normalize paths to ensure they don't include bucket prefix and clean whitespace
    const normalizePath = (path: string) => {
      if (!path) return null;
      const cleaned = path.trim();
      return cleaned.startsWith('workout-pdfs/') 
        ? cleaned.substring('workout-pdfs/'.length)
        : cleaned;
    };

    // Payment completed - return file paths (not signed URLs)
    // Client will request signed URLs on-demand via /signed-url endpoint
    const mainPdfPath = product?.primary_pdf_path || product?.pdf_url;
    const orderTier = (data as any).tier || 'elit';
    const rawBonusAssets = product?.bonus_assets || [];
    // Temel tier gets no bonuses
    const bonusAssets = orderTier === 'temel' ? [] : (Array.isArray(rawBonusAssets) ? rawBonusAssets : []);
    
    const downloads: Array<{ name: string; path: string }> = [];
    const bonuses: Array<{ title: string; path: string }> = [];

    if (mainPdfPath) {
      const normalized = normalizePath(mainPdfPath);
      if (normalized) {
        downloads.push({
          name: product?.title || product?.name || "Ana Program",
          path: normalized,
        });
      }
    }

    for (const bonus of bonusAssets) {
      if (bonus.path) {
        const normalized = normalizePath(bonus.path);
        if (normalized) {
          bonuses.push({
            title: bonus.title || "Bonus",
            path: normalized,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        status: "paid",
        id: data.id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        amount: data.amount,
        product_name: product?.name || "",
        product_title: product?.title || null,
        tier: orderTier,
        downloads,
        bonuses,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in get-order:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});