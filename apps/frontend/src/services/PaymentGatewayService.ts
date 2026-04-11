export const PaymentGatewayService = {
    loadScript: (): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Avoid loading twice
            if ((window as any).CinetPay) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.cinetpay.com/seamless/main.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Erreur de chargement du SDK CinetPay'));
            document.body.appendChild(script);
        });
    },

    processPayment: async (
        amount: number,
        transactionId: string,
        customerName: string,
        customerPhone: string,
        customerEmail: string,
        onSuccess: (data: any) => void,
        onError: (err: any) => void
    ) => {
        try {
            await PaymentGatewayService.loadScript();
        } catch (err) {
            onError(err);
            return;
        }

        // Identifiants factices pour le développement, à remplacer par les vrais dans le back-office CinetPay
        const CINETPAY_SITE_ID = import.meta.env.VITE_CINETPAY_SITE_ID || '5865203';
        const CINETPAY_API_KEY = import.meta.env.VITE_CINETPAY_API_KEY || '17142603865dfbc599a0';

        (window as any).CinetPay.setConfig({
            apikey: CINETPAY_API_KEY,
            site_id: CINETPAY_SITE_ID,
            notify_url: 'https://votre-domaine.com/webhook/cinetpay',
            mode: 'PRODUCTION'
        });

        (window as any).CinetPay.getCheckout({
            transaction_id: transactionId,
            amount: amount,
            currency: 'XOF',
            channels: 'ALL',
            description: 'Achat de produits pharmaceutiques - PharmaGo',
            // customer info
            customer_name: customerName || 'Client',
            customer_surname: 'PharmaGo',
            customer_email: customerEmail || 'client@pharmago.ci',
            customer_phone_number: customerPhone,
            customer_address: 'Abidjan',
            customer_city: 'Abidjan',
            customer_country: 'CI',
            customer_state: 'CI',
            customer_zip_code: '225',
        });

        // Écoute de la réponse du web widget
        (window as any).CinetPay.waitResponse(function (data: any) {
            if (data.status === "REFUSED") {
                onError(data);
            } else if (data.status === "ACCEPTED") {
                onSuccess(data);
            }
        });

        (window as any).CinetPay.onError(function (data: any) {
            onError(data);
        });
    }
};
