import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ConfirmPaymentRequest {
  paymentIntentId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { paymentIntentId }: ConfirmPaymentRequest = await req.json()

    if (!paymentIntentId) {
      throw new Error('Payment Intent ID is required')
    }

    // Retrieve payment intent from Stripe
    const stripeResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
      },
    })

    if (!stripeResponse.ok) {
      throw new Error('Failed to retrieve payment intent from Stripe')
    }

    const paymentIntent = await stripeResponse.json()

    // Update investment status based on payment status
    const newStatus = paymentIntent.status === 'succeeded' ? 'active' : 'pending'

    const { error: investmentError } = await supabaseClient
      .from('investments')
      .update({ status: newStatus })
      .eq('payment_intent_id', paymentIntentId)
      .eq('user_id', user.id)

    if (investmentError) {
      throw new Error(`Failed to update investment: ${investmentError.message}`)
    }

    // Update payment transaction status
    const { error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .update({ 
        status: paymentIntent.status,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntentId)

    if (transactionError) {
      throw new Error(`Failed to update transaction: ${transactionError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentIntent.status,
        investmentStatus: newStatus
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})