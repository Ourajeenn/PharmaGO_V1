import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MobilePaymentProps {
    amount: number;
    onSuccess?: () => void;
}

export const MobilePayment = ({ amount, onSuccess }: MobilePaymentProps) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const { toast } = useToast();

    const providers = [
        { id: 'orange', name: 'Orange Money', color: 'bg-orange-500', logo: '🔶' },
        { id: 'mtn', name: 'MTN Mobile Money', color: 'bg-yellow-500', logo: '📱' },
        { id: 'wave', name: 'Wave', color: 'bg-blue-500', logo: '🌊' },
        { id: 'moov', name: 'Moov Money', color: 'bg-blue-600', logo: '🔹' },
    ];

    const handlePayment = async () => {
        if (!selectedProvider || !phoneNumber) {
            toast({
                title: 'Erreur',
                description: 'Veuillez sélectionner un opérateur et saisir votre numéro',
                variant: 'destructive',
            });
            return;
        }

        setProcessing(true);

        try {
            const { data, error } = await supabase.functions.invoke('process-payment', {
                body: {
                    amount,
                    phoneNumber,
                    provider: selectedProvider,
                }
            });

            if (error) throw error;

            toast({
                title: '✅ Paiement initié',
                description: data.message || `Confirmez le paiement de ${amount} FCFA sur votre téléphone`,
            });

            // In a real scenario, we might wait for a webhook or poll for status
            // For the demo, we show success after initiation
            onSuccess?.();
        } catch (error: any) {
            console.error('Payment error:', error);
            toast({
                title: '❌ Échec du paiement',
                description: error.message || 'Une erreur est survenue lors de la communication avec le service de paiement',
                variant: 'destructive',
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Paiement Mobile
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Montant à payer</p>
                    <p className="text-3xl font-bold text-primary">{amount.toLocaleString()} FCFA</p>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-medium">Sélectionnez votre opérateur:</p>
                    <div className="grid grid-cols-1 gap-3">
                        {providers.map((provider) => (
                            <button
                                key={provider.id}
                                onClick={() => setSelectedProvider(provider.id)}
                                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${selectedProvider === provider.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                `}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{provider.logo}</span>
                                    <div className="text-left">
                                        <p className="font-medium">{provider.name}</p>
                                        <p className="text-xs text-muted-foreground">Paiement instantané</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedProvider && (
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Numéro de téléphone</label>
                            <Input
                                type="tel"
                                placeholder="+225 XX XX XX XX"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handlePayment}
                            className="w-full"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Traitement en cours...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Payer {amount.toLocaleString()} FCFA
                                </>
                            )}
                        </Button>
                    </div>
                )}

                <div className="pt-4 border-t">
                    <p className="text-xs text-center text-muted-foreground">
                        🔒 Paiement sécurisé et crypté
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
