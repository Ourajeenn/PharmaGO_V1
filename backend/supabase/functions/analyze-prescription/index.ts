// @ts-nocheck
import { serve } from "std/http/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { imageBase64, action, medications, medicationName } = await req.json();

        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
        if (!OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not configured");
        }

        let model = "gpt-4o-mini";
        let messages = [];
        let max_tokens = 1000;

        if (action === "analyze") {
            if (!imageBase64) {
                throw new Error("imageBase64 is required for analyze action");
            }
            messages = [
                {
                    role: "system",
                    content: `Tu es un assistant médical spécialisé dans l'analyse d'ordonnances.
Analyse l'image de l'ordonnance et extrait les informations suivantes au format JSON:
- Liste des médicaments avec nom, dosage, fréquence, durée
- Nom du médecin si visible
- Nom du patient si visible
- Date de l'ordonnance
- Avertissements potentiels
- Interactions médicamenteuses possibles

Important: Réponds uniquement avec du JSON valide.`,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${imageBase64}`,
                            },
                        },
                        {
                            type: "text",
                            text: "Analyse cette ordonnance médicale et extrais toutes les informations pertinentes.",
                        },
                    ],
                },
            ];
        } else if (action === "check_interactions") {
            model = "gpt-4o-mini";
            max_tokens = 500;
            messages = [
                {
                    role: "system",
                    content: "Tu es un pharmacien expert en interactions médicamenteuses. Analyse la liste de médicaments et identifie toutes les interactions potentielles.",
                },
                {
                    role: "user",
                    content: `Vérifie les interactions entre ces médicaments: ${(medications || []).join(", ")}. Réponds uniquement avec une liste d'avertissements.`,
                },
            ];
        } else if (action === "suggest_alternatives") {
            model = "gpt-4o-mini";
            max_tokens = 300;
            messages = [
                {
                    role: "system",
                    content: "Tu es un pharmacien expert. Suggère des alternatives génériques ou similaires pour les médicaments.",
                },
                {
                    role: "user",
                    content: `Suggère des alternatives pour ${medicationName}. Réponds avec une liste de max 5 alternatives avec une brève explication.`,
                },
            ];
        } else {
            throw new Error("Invalid action provided");
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens,
                response_format: action === "analyze" ? { type: "json_object" } : undefined
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OpenAI API error:", response.status, errorData);
            throw new Error("Erreur lors de l'appel à l'API OpenAI.");
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        return new Response(JSON.stringify({ content }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Analyze prescription error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
