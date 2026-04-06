import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const allowedOrigins = [
  "https://sicramanigelistir.lovable.app",
  "https://shop.thirteenconcept.com",
  "https://jump.thirteenconcept.com",
  "http://localhost:5173"
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

// Simple rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

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

    // Parse query parameters for GET
    const url = new URL(req.url);
    const oidParam = url.searchParams.get("oid");
    const token = url.searchParams.get("token");
    const path = url.searchParams.get("path");

    if (!oidParam || !token || !path) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: oid, token, path" }),
        { 
          status: 400, 
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

    console.log("Signed URL request for order:", orderId, "path:", path);

    // Verify order and token (same logic as get-order)
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, access_token, token_expires_at, payment_status")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      console.error("Order not found:", error);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Verify access token
    if (order.access_token !== token) {
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
    if (order.token_expires_at && new Date(order.token_expires_at) < new Date()) {
      const newExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      await supabase
        .from("orders")
        .update({ token_expires_at: newExpiry.toISOString() })
        .eq("id", order.id);
      console.log("Auto-extended expired token for order:", order.id);
    }

    // Only allow if payment is completed
    if (order.payment_status !== "completed") {
      return new Response(
        JSON.stringify({ error: "Payment not completed" }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Normalize path - remove bucket prefix if present and clean whitespace
    const cleanPath = path.trim();
    const normalizedPath = cleanPath.startsWith('workout-pdfs/')
      ? cleanPath.substring('workout-pdfs/'.length)
      : cleanPath;

    console.log("Original path:", path);
    console.log("Cleaned path:", cleanPath);
    console.log("Normalized path:", normalizedPath);
    console.log("Attempting to create signed URL for bucket: workout-pdfs");

    // Generate signed URL with 10 minute expiry
    const { data: signedData, error: signError } = await supabase.storage
      .from("workout-pdfs")
      .createSignedUrl(normalizedPath, 600); // 10 minutes

    if (signError || !signedData?.signedUrl) {
      console.error("Error creating signed URL. Path:", normalizedPath);
      console.error("Error details:", JSON.stringify(signError));
      return new Response(
        JSON.stringify({ error: "Failed to generate download link" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Successfully created signed URL");

    return new Response(
      JSON.stringify({ url: signedData.signedUrl }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in signed-url:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
