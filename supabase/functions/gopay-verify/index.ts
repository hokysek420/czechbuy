import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const body = await req.json();
    const { order_id, payment_id, status } = body;

    // Determine payment status
    let paymentStatus = "pending";
    let orderStatus = "pending";

    switch (status) {
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
      default:
        paymentStatus = "failed";
        orderStatus = "cancelled";
    }

    // Update order status
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        payment_status: paymentStatus,
        order_status: orderStatus,
        payment_reference: payment_id,
        gopay_state: paymentStatus === "paid" ? "PAID" : status,
      }),
    });

    // Log the verification
    await fetch(`${supabaseUrl}/rest/v1/payment_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        order_id: order_id,
        payment_method: "gopay",
        action: "verify_payment",
        status: paymentStatus,
        payload: { payment_id, status },
      }),
    });

    return new Response(JSON.stringify({
      success: true,
      payment_status: paymentStatus,
      order_status: orderStatus,
    }), {
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
