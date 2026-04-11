import { supabase } from "@/integrations/supabase/client";

export const SMSService = {
    /**
     * Envoie un SMS au client via une Edge Function Supabase (connectée à Twilio ou Infobip)
     * En mode developpement (si l'Edge Function échoue), simule l'envoi dans la console.
     */
    sendDeliveryUpdate: async (phoneNumber: string, orderId: string, status: 'en_route' | 'livre' | 'retarde', driverName?: string) => {
        let messageText = '';

        switch (status) {
            case 'en_route':
                messageText = `PharmaGo: Votre commande #${orderId} est en route ! Le livreur ${driverName || ''} arrivera bientôt. Préparez-vous à la réception.`;
                break;
            case 'livre':
                messageText = `PharmaGo: Votre commande #${orderId} a été livrée avec succès. Merci pour votre confiance !`;
                break;
            case 'retarde':
                messageText = `PharmaGo: Désolé, votre commande #${orderId} a un léger retard dû à la circulation. Arrivée prévue dans 15 min.`;
                break;
            default:
                messageText = `PharmaGo: Mise à jour statut de votre commande #${orderId}.`;
        }

        try {
            console.log('Appel de l\'Edge Function Deno "send-sms"...');
            // Appel de la vraie fonction serverless qui exécutera le cURL vers l'API SMS (Twilio/Infobip/MTN)
            const { data, error } = await supabase.functions.invoke('send-sms', {
                body: { phoneNumber, message: messageText }
            });

            if (error) throw error;
            console.log("SMS envoyé avec succès via API.", data);
            return { success: true, data };
        } catch (error) {
            // Le fallback (simulation) est vital en attendant d'avoir provisionné l'API Key de Prod Twilio
            console.warn("L'Edge Function de SMS n'est pas encore déployée ou est indisponible. Simulation de l'envoi.");
            console.log(`\n========================================\n📱 [SMS SIMULÉ] Envoyé à : ${phoneNumber}\n📩 Contenu : ${messageText}\n========================================\n`);
            return { success: true, simulated: true, message: messageText };
        }
    }
};
