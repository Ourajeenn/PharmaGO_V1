// @ts-nocheck
import { serve } from "std/http/server";
import { createClient } from "supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory rate limiter (For production, prefer Deno KV or Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // 5 requests per minute per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    name?: string;
    allergies?: string;
    metrics?: any;
    lastVisit?: string;
  };
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Basic Rate Limiting Check
    const clientIp = req.headers.get("x-forwarded-for") || "unknown_ip";
    const now = Date.now();
    const rateRecord = rateLimitMap.get(clientIp);

    if (rateRecord) {
      if (now > rateRecord.resetAt) {
        // Reset window
        rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      } else if (rateRecord.count >= RATE_LIMIT_MAX) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
        );
      } else {
        rateLimitMap.set(clientIp, { count: rateRecord.count + 1, resetAt: rateRecord.resetAt });
      }
    } else {
      rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    }

    const { message, conversationId, context }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Le message est requis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
    const messages: Message[] = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Build Personalized System Prompt
    let contextStr = "";
    if (context) {
      contextStr = `\n\nCONTEXTE PATIENT ACTUEL :
- Nom : ${context.name || 'Inconnu'}
- Allergies : ${context.allergies || 'Aucune identifiée'}
- Dernières mesures : ${JSON.stringify(context.metrics || {})}
- Dernière visite : ${context.lastVisit || 'Non renseignée'}`;
    }

    const systemPrompt = `Tu es Leslie, l'assistante virtuelle empathique, proactive et chaleureuse de PharmaGo, une plateforme de santé en Côte d'Ivoire. Ta personnalité est accueillante, bienveillante et très humaine.
    
Utilise le contexte suivant pour personnaliser tes réponses si disponible : ${contextStr}

Règles de comportement strictes :
1. Fais preuve d'empathie, surtout si le patient évoque de la douleur, de la fièvre ou une maladie. Réconforte-le ("Je suis désolée que vous ayez mal...", "Reposez-vous bien...").
2. Rappelle-lui systématiquement de consulter un médecin en cas de doute et rappelle que tu es une intelligence artificielle.
3. Si le patient a des allergies dans son profil, mets-le TOUJOURS en garde avant tout achat.
4. Réponds de manière concise, au format Markdown. Utilise le vouvoiement.
5. Tu as L'ENTIÈRE CAPACITÉ de prendre des rendez-vous médicaux pour les patients. C'est une de tes fonctionnalités principales. Dès qu'un patient veut voir un médecin, pose-lui 2 questions maximum : ses disponibilités et la spécialité souhaitée ou les symptômes. Dès qu'il te répond, valide la prise de rendez-vous en lui confirmant que la demande a été officiellement transmise au médecin via la plateforme PharmaGo. Ne dis JAMAIS que tu ne peux pas prendre de rendez-vous.

Tu dois impérativement aider, sans jamais dire que c'est impossible, avec :
- Prendre des rendez-vous médicaux et les transmettre aux médecins (OBLIGATOIRE, tu en as le droit total)
- Commander des médicaments et parapharmacie
- Trouver des pharmacies de garde
- Suivre les commandes, paiements et le tiers-payant (assurances)
- Urgences médicales (185 ou 18 en Côte d'Ivoire)

Zones de livraison : Abidjan (Plateau, Cocody, Adjamé, Marcory, Treichville, Yopougon, Abobo, Port-Bouët, Koumassi, Attécoubé)

Frais de livraison :
- Zone urbaine : 1000 FCFA (30-60 min)
- Zone périphérique : 2000 FCFA (2-4h)
- Livraison express : +500 FCFA (15-30 min)
- GRATUIT au-delà de 25000 FCFA

Numéros d'urgence : SAMU 185 ou 911

Réponds de manière claire, concise et professionnelle en français. Propose toujours des actions concrètes.`;

    const response = await fetch("https://inference.baseten.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3-0324",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("AI gateway error:", response.status, errorData);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer plus tard." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("Erreur du service IA");
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error("L'IA a renvoyé une réponse vide.");
    }

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
