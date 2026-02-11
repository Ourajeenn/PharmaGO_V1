import { serve } from "std/http/server"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSRequest {
    to: string;
    message: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, message } = await req.json() as SMSRequest

        const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
        const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
        const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
            // If credentials are not set, log it and return a simulated success for development
            console.warn('Twilio credentials not configured. SMS simulation mode.')
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'SMS sent (Simulated)',
                    to,
                    content: message
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        const basicAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)

        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${basicAuth}`
                },
                body: new URLSearchParams({
                    To: to,
                    From: TWILIO_PHONE_NUMBER,
                    Body: message
                }).toString()
            }
        )

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || 'Failed to send SMS via Twilio')
        }

        return new Response(
            JSON.stringify({ success: true, sid: result.sid }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
