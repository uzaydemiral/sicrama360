import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const callbackSchema = z.object({
  merchant_oid: z.string().length(32, "Invalid merchant_oid format"),
  status: z.enum(["success", "failed"], { 
    errorMap: () => ({ message: "Invalid payment status" })
  }),
  total_amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  hash: z.string().min(1, "Hash is required")
});

function queueOrderEmail(orderId: string) {
  const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").replace("/rest/v1", "");

  if (!supabaseUrl) {
    console.error("SUPABASE_URL missing, cannot trigger order email");
    return;
  }

  const emailPromise = fetch(`${supabaseUrl}/functions/v1/resend-order-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(`resend-order-email failed (${response.status}): ${responseBody}`);
      }
      console.log("Order email trigger queued for:", orderId);
    })
    .catch((error) => {
      console.error("Failed to trigger order email:", error);
    });

  const edgeRuntime = (globalThis as any).EdgeRuntime;
  if (edgeRuntime?.waitUntil) {
    edgeRuntime.waitUntil(emailPromise);
    return;
  }

  void emailPromise;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const formData = await req.formData();
    const rawData = {
      merchant_oid: formData.get("merchant_oid"),
      status: formData.get("status"),
      total_amount: formData.get("total_amount"),
      hash: formData.get("hash")
    };

    // Validate input with Zod
    const validationResult = callbackSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error("PayTR callback validation failed:", validationResult.error.errors);
      return new Response("OK", { status: 200 });
    }

    const { merchant_oid: merchantOid, status, total_amount: totalAmount, hash } = validationResult.data;

    console.log("PayTR callback received - merchant_oid:", merchantOid, "status:", status, "total_amount:", totalAmount);

    // Verify PayTR hash
    const merchantKey = Deno.env.get("PAYTR_MERCHANT_KEY") ?? "";
    const merchantSalt = Deno.env.get("PAYTR_MERCHANT_SALT") ?? "";
    
    const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`;
    const enc = new TextEncoder();
    const keyData = enc.encode(merchantKey);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const dataToSign = enc.encode(hashStr);
    const signature = await crypto.subtle.sign("HMAC", key, dataToSign);
    const calculatedHash = btoa(String.fromCharCode(...new Uint8Array(signature)));

    if (calculatedHash !== hash) {
      console.error("Hash verification failed");
      return new Response("OK", { status: 200 });
    }

    console.log("Hash verified successfully");

    // Update order status
    const paymentStatus = status === "success" ? "completed" : "failed";
    const orderId = merchantOid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");

    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        callback_received_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("id, access_token")
      .single();

    if (updateError) {
      console.error("Failed to update order:", updateError);
      return new Response("OK", { status: 200 });
    }

    console.log("Order payment status updated:", paymentStatus);

    if (status === "success" && order?.access_token) {
      queueOrderEmail(order.id);
    }

    return new Response("OK", { status: 200 });
  } catch (error: any) {
    console.error("Error in paytr-callback:", error);
    return new Response("OK", { status: 200 });
  }
});