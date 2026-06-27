import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GoPayWebhookPayload {
  id: string;
  order_id: string;
  state: string;
  amount: number;
  currency: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const payload = await req.json() as GoPayWebhookPayload;

    // Log the payment attempt
    await fetch(`${supabaseUrl}/rest/v1/payment_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        order_id: payload.order_id,
        payment_method: "gopay",
        action: "webhook",
        status: payload.state,
        payload: payload,
      }),
    });

    // Update order status based on GoPay state
    let paymentStatus = "pending";
    let orderStatus = "pending";

    switch (payload.state) {
      case "PAID":
        paymentStatus = "paid";
        orderStatus = "paid";
        break;
      case "CREATED":
        paymentStatus = "awaiting_payment";
        orderStatus = "awaiting_payment";
        break;
      case "CANCELLED":
      case "TIMEOUTED":
        paymentStatus = "failed";
        orderStatus = "cancelled";
        break;
      case "REFUNDED":
        paymentStatus = "refunded";
        break;
    }

    await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${payload.order_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        payment_status: paymentStatus,
        order_status: orderStatus,
        payment_reference: payload.id,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
