import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FALLBACK_REDIRECT_ORIGIN = "https://sicramanigelistir.lovable.app";

function normalizeOrderId(oid: string): string {
  if (oid.includes("-")) return oid;
  if (oid.length === 32) {
    return oid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  }
  return oid;
}

function getSafeOrigin(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const oid = url.searchParams.get("oid") || "";
  const token = url.searchParams.get("token") || "";
  const isFail = url.searchParams.get("status") === "fail";

  if (!oid || !token) {
    const failTarget = `${FALLBACK_REDIRECT_ORIGIN}/odeme-hata`;
    return Response.redirect(failTarget, 302);
  }

  const orderId = normalizeOrderId(oid);
  let redirectOrigin: string | null = null;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: order, error } = await supabase
      .from("orders")
      .select("redirect_url")
      .eq("id", orderId)
      .eq("access_token", token)
      .maybeSingle();

    if (error) {
      console.error("Payment-success order lookup error:", error);
    }

    redirectOrigin = getSafeOrigin(order?.redirect_url ?? null);
  } catch (error) {
    console.error("Payment-success redirect resolution failed:", error);
  }

  const origin = redirectOrigin ?? FALLBACK_REDIRECT_ORIGIN;
  const redirectTarget = isFail
    ? `${origin}/odeme-hata`
    : `${origin}/tesekkurler?oid=${encodeURIComponent(oid)}&token=${encodeURIComponent(token)}`;

  console.log("Payment-success redirecting to:", redirectTarget, "for order:", orderId, "isFail:", isFail);
  return Response.redirect(redirectTarget, 302);
});
