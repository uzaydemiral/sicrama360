import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  productId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  redirectUrl: string;
  amount?: number;
  couponCode?: string;
}

// Validation schema
const paymentSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  customerName: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/, "Name must contain only letters"),
  customerEmail: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters"),
  customerPhone: z.string()
    .trim()
    .regex(/^5[0-9]{9}$/, "Phone must be 10 digits starting with 5"),
  redirectUrl: z.string().url("Invalid redirect URL"),
  amount: z.number().positive().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  tier: z.enum(["temel", "yem", "elit", "vip", "magaza"]).optional().default("elit"),
});

// Per-IP rate limiting: max 5 payment attempts per IP per hour
const RATE_LIMIT_WINDOW_HOURS = 1;
const MAX_ATTEMPTS_PER_IP = 20;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Per-IP rate limiting check
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     req.headers.get("cf-connecting-ip") ||
                     "unknown";

    console.log("Payment request from IP:", clientIp);

    // Clean up old rate limit records first
    await supabase
      .from("rate_limit_tracking")
      .delete()
      .lt("window_start", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - RATE_LIMIT_WINDOW_HOURS);

    // Check current rate limit for this IP
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from("rate_limit_tracking")
      .select("request_count, window_start")
      .eq("ip_address", clientIp)
      .eq("endpoint", "create-paytr-payment")
      .gte("window_start", windowStart.toISOString())
      .order("window_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!rateLimitError && rateLimitData) {
      if (rateLimitData.request_count >= MAX_ATTEMPTS_PER_IP) {
        console.log(`Rate limit exceeded for IP ${clientIp}: ${rateLimitData.request_count} attempts`);
        return new Response(
          JSON.stringify({ 
            error: "Too many payment attempts. Please try again later.",
            retryAfter: "1 hour"
          }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json",
              "Retry-After": "3600"
            } 
          }
        );
      }

      // Update existing rate limit record
      await supabase
        .from("rate_limit_tracking")
        .update({ 
          request_count: rateLimitData.request_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq("ip_address", clientIp)
        .eq("endpoint", "create-paytr-payment")
        .eq("window_start", rateLimitData.window_start);
    } else {
      // Create new rate limit record for this IP
      await supabase
        .from("rate_limit_tracking")
        .insert({
          ip_address: clientIp,
          endpoint: "create-paytr-payment",
          request_count: 1,
          window_start: new Date().toISOString()
        });
    }

    const requestBody = await req.json();

    // Validate input
    const validationResult = paymentSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      console.log("Validation failed:", errors);
      
      return new Response(
        JSON.stringify({ 
          error: "Invalid input data",
          details: errors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { productId, customerName, customerEmail, customerPhone, redirectUrl, amount: customAmount, couponCode, tier } = validationResult.data;

    // For "magaza" tier, skip product lookup and use custom amount directly
    let product: any = null;
    
    if (tier !== "magaza") {
      // Get product details
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError || !productData) {
        console.error("Product not found:", productError);
        return new Response(
          JSON.stringify({ error: "Product not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      product = productData;
    } else {
      // For magaza tier, look up store product name for basket
      const { data: storeProduct } = await supabase
        .from("store_products")
        .select("name")
        .eq("id", productId)
        .maybeSingle();
      
      product = { name: storeProduct?.name || "Mağaza Siparişi", price: customAmount || 0 };
    }

    // Tier-based pricing
    const TIER_PRICES: Record<string, number> = {
      temel: 2450,
      yem: 3450,
      elit: 3450,
      vip: 8900,
    };

    const tierPrice = tier === "magaza" ? (customAmount || product.price) : (TIER_PRICES[tier] ?? product.price);
    
    // Validate coupon code server-side if provided
    let basePrice = tierPrice;
    
    if (couponCode) {
      const { data: discount, error: discountError } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (!discountError && discount) {
        // Check expiration
        if (!discount.expires_at || new Date(discount.expires_at) > new Date()) {
          // Check max uses
          if (!discount.max_uses || discount.current_uses < discount.max_uses) {
            // Apply discount
            if (discount.type === 'percent') {
              basePrice = tierPrice * (1 - Number(discount.value) / 100);
            } else {
              basePrice = Math.max(0, tierPrice - Number(discount.value));
            }
            
            // Increment usage count
            await supabase
              .from('discount_codes')
              .update({ current_uses: discount.current_uses + 1 })
              .eq('id', discount.id);
            
            console.log(`Applied coupon ${couponCode}, discount: ${tierPrice - basePrice}`);
          }
        }
      }
    }

    // Validate custom amount against tier price (with or without coupon)
    let finalAmount = basePrice;
    
    if (tier === "magaza") {
      // For magaza, trust the custom amount (it comes from store_products prices)
      finalAmount = customAmount && customAmount > 0 ? customAmount : basePrice;
    } else if (customAmount && customAmount > 0) {
      const isValidAmount = Math.abs(customAmount - basePrice) < 1;
      if (isValidAmount) {
        finalAmount = customAmount;
      } else {
        console.log(`Invalid custom amount ${customAmount}, expected: ${basePrice} (tier: ${tier})`);
      }
    }

    console.log("Final payment amount:", finalAmount, "(tier:", tier, ", tierPrice:", tierPrice, ", basePrice:", basePrice, ")");

    // For magaza tier, use the default product as FK reference since store_products aren't in the products table
    const orderProductId = tier === "magaza" ? "63112ab4-e76e-484d-b106-c4d771a761a6" : productId;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        product_id: orderProductId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        amount: finalAmount,
        payment_status: "pending",
        redirect_url: redirectUrl,
        tier: tier,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Failed to create order:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Order created:", order.id);

    // Generate secure access token (HMAC of order_id + timestamp + secret)
    const encoder = new TextEncoder();
    const tokenSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const tokenData = `${order.id}:${Date.now()}`;
    const tokenKeyData = encoder.encode(tokenSecret);
    const tokenKey = await crypto.subtle.importKey(
      "raw",
      tokenKeyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const tokenSignature = await crypto.subtle.sign("HMAC", tokenKey, encoder.encode(tokenData));
    const accessToken = btoa(String.fromCharCode(...new Uint8Array(tokenSignature))).replace(/[+/=]/g, (m) => ({'+': '-', '/': '_', '=': ''}[m] || ''));
    
    // Token expires in 365 days so customers can always access their purchase
    const tokenExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    
    // Update order with access token
    await supabase
      .from("orders")
      .update({ 
        access_token: accessToken,
        token_expires_at: tokenExpiresAt.toISOString()
      })
      .eq("id", order.id);

    console.log("Access token generated for order");

    // PayTR configuration
    const merchantId = Deno.env.get("PAYTR_MERCHANT_ID") ?? "";
    const merchantKey = Deno.env.get("PAYTR_MERCHANT_KEY") ?? "";
    const merchantSalt = Deno.env.get("PAYTR_MERCHANT_SALT") ?? "";
    
    const merchantOid = order.id.replace(/-/g, ''); // Remove hyphens for PayTR compatibility
    const userIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const emailStr = customerEmail;
    const paymentAmount = Math.round(finalAmount * 100).toString(); // Convert to kuruş - use discounted price
    const currency = "TL";
    const testMode = "0"; // Live mode
    
    // Prepare basket as per PayTR format - use discounted price
    const basket = JSON.stringify([
      [product.name, (finalAmount).toFixed(2), 1]
    ]);
    
    // BASE64 encode the basket (REQUIRED by PayTR)
    const basketBytes = encoder.encode(basket);
    const userBasket = btoa(String.fromCharCode(...basketBytes));
    
    const noInstallment = "0"; // No installment
    const maxInstallment = "0";
    
    // PayTR URLs - success/fail go through payment-success edge function (postMessage for iframe breakout)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace("/rest/v1", "");
    const callbackUrl = `${supabaseUrl}/functions/v1/paytr-callback`;
    const successUrl = `${supabaseUrl}/functions/v1/payment-success?oid=${merchantOid}&token=${accessToken}`;
    const failUrl = `${supabaseUrl}/functions/v1/payment-success?oid=${merchantOid}&token=${accessToken}&status=fail`;
    
    console.log("PayTR URLs:", {
      callbackUrl,
      successUrl,
      failUrl,
      frontendOrigin: redirectUrl
    });
    
    // Generate PayTR token (must match exact order from PayTR docs)
    const hashStr = `${merchantId}${userIp}${merchantOid}${emailStr}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`;
    
    const keyData = encoder.encode(merchantKey);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const dataToSign = encoder.encode(hashStr + merchantSalt);
    const signature = await crypto.subtle.sign("HMAC", key, dataToSign);
    
    // Convert to BASE64 (not hex!) as per PayTR documentation
    const paytrToken = btoa(String.fromCharCode(...new Uint8Array(signature)));

    console.log("Generated PayTR token");

    // Prepare PayTR request (must include merchant_key and merchant_salt as per docs)
    const paytrData = new URLSearchParams({
      merchant_id: merchantId,
      merchant_key: merchantKey,
      merchant_salt: merchantSalt,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email: emailStr,
      payment_amount: paymentAmount,
      paytr_token: paytrToken,
      user_basket: userBasket,
      debug_on: testMode,
      no_installment: noInstallment,
      max_installment: maxInstallment,
      user_name: customerName,
      user_address: "Türkiye",
      user_phone: customerPhone,
      merchant_ok_url: successUrl,
      merchant_fail_url: failUrl,
      timeout_limit: "30",
      callback_url: callbackUrl,
      currency: currency,
      test_mode: testMode,
      lang: "tr",
    });

    // Send request to PayTR
    const paytrResponse = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: paytrData.toString(),
    });

    const paytrResult = await paytrResponse.json();
    console.log("PayTR response:", paytrResult);

    if (paytrResult.status === "success") {
      // Update order with PayTR order ID
      await supabase
        .from("orders")
        .update({ paytr_order_id: paytrResult.token })
        .eq("id", order.id);

      return new Response(
        JSON.stringify({
          success: true,
          token: paytrResult.token,
          iframeUrl: `https://www.paytr.com/odeme/guvenli/${paytrResult.token}`,
          orderId: order.id,
          orderOid: merchantOid,
          accessToken,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      console.error("PayTR error:", paytrResult);
      return new Response(
        JSON.stringify({ error: "Payment initialization failed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in create-paytr-payment:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
