import { useState, useRef } from 'react';
// tesseract.js is loaded dynamically to reduce initial bundle
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Camera, Upload, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PrescriptionScannerProps {
    onScanComplete: (medicines: string[]) => void;
}

export const PrescriptionScanner = ({ onScanComplete }: PrescriptionScannerProps) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processImage = async (imageSrc: string) => {
        setIsProcessing(true);
        setProgress(0);
        try {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('fra', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                }
            });

            const { data: { text } } = await worker.recognize(imageSrc);
            await worker.terminate();

            // Simple logic to extract medicine-like words (starting with caps or list markers)
            const lines = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 3 && /^[A-Z]/.test(line)); // Basic heuristic

            if (lines.length > 0) {
                toast.success(`${lines.length} médicaments détectés !`);
                onScanComplete(lines);
            } else {
                toast.warning("Aucun médicament détecté. Essayez une image plus nette.");
            }
        } catch (error) {
            console.error('OCR Error:', error);
            toast.error("Erreur lors de la lecture de l'ordonnance");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target?.result as string;
                setImagePreview(src);
                processImage(src);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card className="border-dashed border-2 bg-slate-50/50">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                {isProcessing ? (
                    <div className="space-y-4 py-4">
                        <div className="relative h-20 w-20 mx-auto">
                            <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-primary">
                                {progress}%
                            </div>
                        </div>
                        <p className="font-medium text-slate-700">Analyse de l'ordonnance par l'IA...</p>
                        <p className="text-xs text-slate-500">Extraction des noms de médicaments</p>
                    </div>
                ) : imagePreview ? (
                    <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden border shadow-sm max-w-[200px] mx-auto">
                            <img src={imagePreview} alt="Preview" className="w-full h-auto" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Check className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setImagePreview(null)}>
                            Changer d'image
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Camera className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-900">Scanner une Ordonnance</h3>
                            <p className="text-sm text-slate-500 max-w-xs">
                                Prenez en photo votre ordonnance pour ajouter automatiquement les médicaments à votre panier.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button className="bg-slate-900" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4 mr-2" /> Télécharger
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                                capture="environment"
                            />
                        </div>
                        <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400">
                            <AlertCircle className="h-3 w-3" />
                            Vérifiez toujours les résultats avant de commander
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
