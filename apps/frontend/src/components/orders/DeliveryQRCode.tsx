import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DeliveryQRCodeProps {
    orderId: string;
    pharmacyName?: string;
    status?: string;
}

export const DeliveryQRCode = ({ orderId, pharmacyName, status }: DeliveryQRCodeProps) => {
    return (
        <Card className="w-full max-w-sm mx-auto overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground py-4 text-center">
                <CardTitle className="text-xl font-bold">Code de Livraison</CardTitle>
                <p className="text-xs opacity-90">Présentez ce code à la pharmacie</p>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl shadow-inner border">
                    <QRCodeSVG
                        value={orderId}
                        size={200}
                        level="H"
                        includeMargin={true}
                    />
                </div>

                <div className="text-center space-y-2 w-full">
                    <Badge variant="outline" className="font-mono text-xs">
                        #{orderId.substring(0, 8).toUpperCase()}
                    </Badge>

                    {pharmacyName && (
                        <p className="text-sm font-medium">{pharmacyName}</p>
                    )}

                    {status && (
                        <p className="text-xs text-muted-foreground italic">
                            Statut: {status}
                        </p>
                    )}
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 w-full">
                    <p className="text-[10px] text-yellow-800 text-center">
                        Ce code permet au pharmacien de valider la remise de votre commande en toute sécurité.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default DeliveryQRCode;
