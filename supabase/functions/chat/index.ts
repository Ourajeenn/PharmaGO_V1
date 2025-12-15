import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get or create conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from("chat_conversations")
        .insert({ title: "Nouvelle conversation" })
        .select()
        .single();

      if (convError) throw convError;
      currentConversationId = newConv.id;
    }

    // Save user message
    await supabase.from("chat_messages").insert({
      conversation_id: currentConversationId,
      role: "user",
      content: message,
    });

    // Get conversation history
    const { data: history, error: historyError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true });

    if (historyError) throw historyError;

    // Build messages for AI
    const messages = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Call OpenAI API
    const systemPrompt = `Tu es l'assistant virtuel de PharmaGo, une plateforme de livraison de médicaments en Côte d'Ivoire.

Tu dois aider les utilisateurs avec :
- Commander des médicaments
- Trouver des pharmacies (ouvertes, de garde)
- Suivre leurs commandes
- Questions sur les paiements (Orange Money, Wave, Carte bancaire, Paiement à la livraison)
- Télécharger des ordonnances
- Questions sur la livraison et les frais
- Informations sur les assurances (CMU, MUGEF-CI, CNPS)
- Devenir livreur, médecin ou pharmacie partenaire
- Urgences médicales

Zones de livraison : Abidjan (Plateau, Cocody, Adjamé, Marcory, Treichville, Yopougon, Abobo, Port-Bouët, Koumassi, Attécoubé)

Frais de livraison :
- Zone urbaine : 1000 FCFA (30-60 min)
- Zone périphérique : 2000 FCFA (2-4h)
- Livraison express : +500 FCFA (15-30 min)
- GRATUIT au-delà de 25000 FCFA

Numéros d'urgence : SAMU 185 ou 911

Réponds de manière claire, concise et professionnelle en français. Propose toujours des actions concrètes.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer plus tard." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Paiement requis pour continuer." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erreur du service IA");
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Save AI response
    await supabase.from("chat_messages").insert({
      conversation_id: currentConversationId,
      role: "assistant",
      content: aiMessage,
    });

    return new Response(
      JSON.stringify({
        message: aiMessage,
        conversationId: currentConversationId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
