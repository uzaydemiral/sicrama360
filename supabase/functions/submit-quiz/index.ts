import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

// Rate limiting: max 3 submissions per IP per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3;

const quizSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  answers: z.record(z.union([z.string(), z.number()])),
  currentJump: z.number().min(0).max(200),
  potentialImprovement: z.number().min(0).max(100),
});

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

    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     "unknown";

    console.log(`Quiz submission attempt from IP: ${clientIP}`);

    // Check rate limit
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from("rate_limit_tracking")
      .select("request_count")
      .eq("ip_address", clientIP)
      .eq("endpoint", "submit-quiz")
      .gte("window_start", windowStart)
      .single();

    if (rateLimitError && rateLimitError.code !== "PGRST116") {
      console.error("Rate limit check error:", rateLimitError);
    }

    const currentCount = rateLimitData?.request_count || 0;

    if (currentCount >= MAX_REQUESTS_PER_WINDOW) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = quizSchema.parse(body);

    // Check for duplicate email submission (optional - within last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existingLead } = await supabase
      .from("quiz_leads")
      .select("id")
      .eq("email", validatedData.email)
      .gte("created_at", oneDayAgo)
      .single();

    if (existingLead) {
      return new Response(
        JSON.stringify({ error: "You have already submitted the quiz recently." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert quiz lead
    const { data: lead, error: insertError } = await supabase
      .from("quiz_leads")
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        answers: validatedData.answers,
        current_jump: validatedData.currentJump,
        potential_improvement: validatedData.potentialImprovement,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting quiz lead:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save quiz results." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update rate limit tracking
    if (rateLimitData) {
      await supabase
        .from("rate_limit_tracking")
        .update({ 
          request_count: currentCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq("ip_address", clientIP)
        .eq("endpoint", "submit-quiz")
        .gte("window_start", windowStart);
    } else {
      await supabase
        .from("rate_limit_tracking")
        .insert({
          ip_address: clientIP,
          endpoint: "submit-quiz",
          request_count: 1,
          window_start: new Date().toISOString()
        });
    }

    console.log(`Quiz submitted successfully for: ${validatedData.email}`);

    return new Response(
      JSON.stringify({ success: true, leadId: lead.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-quiz:", error);

    if (error.name === "ZodError") {
      return new Response(
        JSON.stringify({ error: "Invalid input data." }),
        {
          status: 400,
          headers: { ...getCorsHeaders(null), "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      {
        status: 500,
        headers: { ...getCorsHeaders(null), "Content-Type": "application/json" },
      }
    );
  }
});
