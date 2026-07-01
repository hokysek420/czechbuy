import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// GoPay API URLs
const GOPAY_API_URL = "https://gate.gopay.cz/api";
const GOPAY_SANDBOX_URL = "https://gw.sandbox.gopay.com/api";

interface CreatePaymentRequest {
  order_id: string;
  amount: number;
  currency: string;
  description: string;
  return_url: string;
  customer_email: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use sandbox for development (no credentials required for basic testing)
    const isProduction = false; // Set to true when you have real GoPay credentials
    const gopayUrl = isProduction ? GOPAY_API_URL : GOPAY_SANDBOX_URL;

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: CreatePaymentRequest = await req.json();
    const { order_id, amount, currency, description, return_url, customer_email } = body;

    // Log the payment attempt
    await fetch(`${supabaseUrl}/rest/v1/payment_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        order_id: order_id,
        payment_method: "gopay",
        action: "create_payment",
        status: "initiated",
        payload: { amount, currency, customer_email },
      }),
    });

    // Convert amount to cents (GoPay requires amount in smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create GoPay payment
    // Note: For sandbox, we use a simplified flow that simulates payment
    const paymentData = {
      order_number: order_id,
      amount: amountInCents,
      currency: currency || "CZK",
      order_description: description || `Order ${order_id}`,
      items: [{
        name: description || `Order ${order_id}`,
        amount: amountInCents,
        count: 1,
      }],
      callback: {
        return_url: return_url,
        notification_url: `${supabaseUrl}/functions/v1/gopay-webhook`,
      },
      payer: {
        contact: {
          email: customer_email,
        },
      },
    };

    // For sandbox/demo, simulate a successful payment flow
    // In production, you would make an actual API call to GoPay
    const mockPaymentId = `GOPAY_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Update the order with GoPay payment info
    await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        gopay_payment_id: mockPaymentId,
        gopay_state: "CREATED",
        payment_status: "awaiting_payment",
        order_status: "awaiting_payment",
      }),
    });

    // Log successful payment creation
    await fetch(`${supabaseUrl}/rest/v1/payment_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        order_id: order_id,
        payment_method: "gopay",
        action: "payment_created",
        status: "CREATED",
        payload: { gopay_payment_id: mockPaymentId },
      }),
    });

    // Return the payment URL (for demo, redirect to callback with simulated payment)
    const paymentUrl = `${return_url}?payment_id=${mockPaymentId}&order_id=${order_id}&status=PAID`;

    return new Response(JSON.stringify({
      success: true,
      payment_id: mockPaymentId,
      payment_url: paymentUrl,
      gw_url: paymentUrl,
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
