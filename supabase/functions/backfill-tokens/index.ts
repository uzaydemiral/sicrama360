import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Backfill attempt without authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the user's JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Invalid token provided for backfill:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin role
    const { data: isAdmin, error: roleError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !isAdmin) {
      console.error(`Non-admin user ${user.email} attempted to run backfill`);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Audit log
    console.log(`Token backfill initiated by admin: ${user.email} (${user.id})`);

    // Update all completed orders that don't have tokens
    const { data, error } = await supabase
      .from("orders")
      .select("id, customer_email")
      .eq("payment_status", "completed")
      .is("access_token", null);

    if (error) {
      console.error("Error fetching orders:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch orders" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${data?.length || 0} orders to backfill`);

    let updated = 0;
    for (const order of data || []) {
      // Generate token using same method as create-paytr-payment
      const tokenPayload = `${order.id}-${Date.now()}`;
      const encoder = new TextEncoder();
      const tokenData = encoder.encode(tokenPayload);
      const hashBuffer = await crypto.subtle.digest("SHA-256", tokenData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const accessToken = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          access_token: accessToken,
          token_expires_at: expiresAt.toISOString()
        })
        .eq("id", order.id);

      if (updateError) {
        console.error(`Failed to update order ${order.id}:`, updateError);
      } else {
        updated++;
        console.log(`Updated order ${order.id} (${order.customer_email})`);
      }
    }

    console.log(`Backfill complete by ${user.email}: ${updated}/${data?.length || 0} orders updated`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${updated} orders`,
        total: data?.length || 0,
        admin: user.email
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Backfill error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
