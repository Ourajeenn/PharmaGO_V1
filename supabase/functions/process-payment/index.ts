import { serve } from "std/http/server"
import { createClient } from "supabase"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
    amount: number;
    phoneNumber: string;
    provider: 'orange' | 'mtn' | 'wave' | 'moov';
    orderId?: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount, phoneNumber, provider, orderId } = await req.json() as PaymentRequest

        console.log(`Processing ${provider} payment for ${amount} FCFA to ${phoneNumber}`)

        // TODO: Integrate with real payment providers API
        // 1. Orange Money (Orange Money Web Payment API)
        // 2. MTN Mobile Money (MTN MoMo API)
        // 3. Wave (Wave Business API)
        // 4. Moov (CinetPay or direct API)

        // For now, we simulate a successful initiation
        // In production, this would return a checkout URL or initiate a Push USSD

        // We can also log the transaction to a 'payments' table in Supabase
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { error: dbError } = await supabaseClient
            .from('payments')
            .insert({
                amount,
                phone_number: phoneNumber,
                provider,
                order_id: orderId,
                status: 'pending'
            })

        if (dbError) throw dbError

        return new Response(
            JSON.stringify({
                message: 'Payment initiated successfully',
                status: 'pending',
                provider_response: 'Checkout simulated'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
