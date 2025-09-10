import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PaymentRequest {
  amount: number
  investmentType: string
  investmentName: string
  termMonths: number
  expectedReturn: number
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

    const { amount, investmentType, investmentName, termMonths, expectedReturn }: PaymentRequest = await req.json()

    // Validate input
    if (!amount || amount < 100) {
      throw new Error('Minimum investment amount is $100')
    }

    if (!investmentType || !investmentName || !termMonths || !expectedReturn) {
      throw new Error('Missing required investment details')
    }

    // Create Stripe PaymentIntent
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: (amount * 100).toString(), // Convert to cents
        currency: 'usd',
        automatic_payment_methods: JSON.stringify({ enabled: true }),
        metadata: JSON.stringify({
          user_id: user.id,
          investment_type: investmentType,
          investment_name: investmentName,
          term_months: termMonths.toString(),
          expected_return: expectedReturn.toString(),
        }),
      }),
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text()
      throw new Error(`Stripe error: ${error}`)
    }

    const paymentIntent = await stripeResponse.json()

    // Calculate maturity date
    const maturityDate = new Date()
    maturityDate.setMonth(maturityDate.getMonth() + termMonths)

    // Create investment record
    const { data: investment, error: investmentError } = await supabaseClient
      .from('investments')
      .insert({
        user_id: user.id,
        investment_type: investmentType,
        investment_name: investmentName,
        amount: amount,
        expected_return: expectedReturn,
        term_months: termMonths,
        payment_intent_id: paymentIntent.id,
        maturity_date: maturityDate.toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (investmentError) {
      throw new Error(`Database error: ${investmentError.message}`)
    }

    // Create payment transaction record
    const { error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        investment_id: investment.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount,
        currency: 'usd',
        status: 'pending'
      })

    if (transactionError) {
      throw new Error(`Transaction record error: ${transactionError.message}`)
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        investmentId: investment.id,
        certificateNumber: investment.certificate_number
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