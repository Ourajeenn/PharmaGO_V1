import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Copy, CheckCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface ClickCollectQRProps {
    orderId: string;
    pharmacyName: string;
    pharmacyAddress: string;
    preparationTime: number; // in minutes
    items: Array<{ name: string; quantity: number }>;
    totalAmount: number;
}

export const ClickCollectQR = ({
    orderId,
    pharmacyName,
    pharmacyAddress,
    preparationTime,
    items,
    totalAmount
}: ClickCollectQRProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Generate QR Code data
    const qrData = JSON.stringify({
        type: 'PHARMA_GO_PICKUP',
        orderId,
        timestamp: Date.now(),
        signature: btoa(`${orderId}-${Date.now()}`).slice(0, 16)
    });

    useEffect(() => {
        generateQRCode();
    }, [orderId]);

    const generateQRCode = async () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Simple QR-like pattern generation (visual placeholder)
        // In production, use a library like 'qrcode' or 'qr-code-styling'
        const size = 200;
        const moduleSize = 8;
        const modules = Math.floor(size / moduleSize);

        canvas.width = size;
        canvas.height = size;

        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);

        // Generate pseudo-random pattern based on orderId
        const seed = orderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        ctx.fillStyle = '#000000';
        for (let i = 0; i < modules; i++) {
            for (let j = 0; j < modules; j++) {
                // Position patterns (corners)
                const isCorner = (i < 7 && j < 7) || (i < 7 && j >= modules - 7) || (i >= modules - 7 && j < 7);
                const isCornerInner = (i >= 2 && i < 5 && j >= 2 && j < 5) ||
                    (i >= 2 && i < 5 && j >= modules - 5 && j < modules - 2) ||
                    (i >= modules - 5 && i < modules - 2 && j >= 2 && j < 5);

                if (isCorner || isCornerInner) {
                    ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize - 1, moduleSize - 1);
                } else {
                    // Data modules based on seed
                    const hash = (seed * (i + 1) * (j + 1)) % 100;
                    if (hash > 45) {
                        ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize - 1, moduleSize - 1);
                    }
                }
            }
        }

        // Add PharmaGo logo in center
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(size / 2 - 25, size / 2 - 25, 50, 50);
        ctx.fillStyle = '#22C55E';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('P-GO', size / 2, size / 2 + 4);
    };

    const downloadQR = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = `pharma-go-pickup-${orderId.slice(-8)}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
        toast.success('QR Code téléchargé');
    };

    const copyOrderId = () => {
        navigator.clipboard.writeText(orderId);
        toast.success('Numéro de commande copié');
    };

    const openMaps = () => {
        const encodedAddress = encodeURIComponent(pharmacyAddress);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    };

    return (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-green-700">
                    <QrCode className="h-5 w-5" />
                    Retrait en Pharmacie
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status Banner */}
                <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                        <p className="font-medium text-green-800">Commande confirmée</p>
                        <p className="text-sm text-green-600">Présentez ce QR Code à la pharmacie</p>
                    </div>
                </div>

                {/* QR Code Display */}
                <div className="flex flex-col items-center py-4">
                    <canvas
                        ref={canvasRef}
                        className="border-4 border-white shadow-lg rounded-lg"
                        style={{ width: 200, height: 200 }}
                    />
                    <p className="mt-2 text-sm text-muted-foreground font-mono">
                        #{orderId.slice(-8).toUpperCase()}
                    </p>
                </div>

                {/* Pharmacy Info */}
                <div className="space-y-2 p-3 bg-white rounded-lg border">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                            <p className="font-medium">{pharmacyName}</p>
                            <p className="text-sm text-muted-foreground">{pharmacyAddress}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            Prêt dans {preparationTime} minutes
                        </span>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-2">
                    <p className="text-sm font-medium">Récapitulatif:</p>
                    <div className="space-y-1">
                        {items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{item.name}</span>
                                <span>x{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-primary">{totalAmount.toLocaleString()} FCFA</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={downloadQR}>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={copyOrderId}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copier N°
                    </Button>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={openMaps}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Itinéraire vers la pharmacie
                </Button>
            </CardContent>
        </Card>
    );
};

export default ClickCollectQR;
