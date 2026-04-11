import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Camera, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import visionAI from '@/lib/visionAI';
import { useToast } from '@/hooks/use-toast';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    confidence: number;
}

interface AnalysisResult {
    medications: Medication[];
    warnings: string[];
    interactions: string[];
}

export const PrescriptionScanner = ({ onAnalysisComplete }: { onAnalysisComplete?: (medications: Medication[]) => void }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('L\'image est trop grande (max 5MB)');
            return;
        }

        await analyzeImage(file);
    };

    const analyzeImage = async (file: File) => {
        setAnalyzing(true);
        setError(null);

        try {
            // Convert image to base64
            const base64 = await visionAI.imageToBase64(file);

            // Analyze prescription
            const result = await visionAI.analyzePrescription(base64);

            setAnalysis(result);

            toast({
                title: '✅ Analyse terminée',
                description: `${result.medications.length} médicament(s) détecté(s)`,
            });

            onAnalysisComplete?.(result.medications);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'analyse';
            setError(errorMessage);
            toast({
                title: '❌ Erreur d\'analyse',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleCameraCapture = () => {
        // Trigger file input with camera
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Scanner l'ordonnance
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="h-24 flex-col"
                        disabled={analyzing}
                    >
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-sm">Importer</span>
                    </Button>
                    <Button
                        onClick={handleCameraCapture}
                        variant="outline"
                        className="h-24 flex-col"
                        disabled={analyzing}
                    >
                        <Camera className="h-8 w-8 mb-2" />
                        <span className="text-sm">Photo</span>
                    </Button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {analyzing && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Analyse en cours...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {analysis && !analyzing && (
                    <div className="space-y-3">
                        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium">Ordonnance analysée</span>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Médicaments détectés:</h4>
                            {analysis.medications.map((med, index) => (
                                <div key={index} className="bg-secondary/20 p-3 rounded-lg space-y-1">
                                    <p className="font-medium">{med.name}</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                        <span>Dosage: {med.dosage}</span>
                                        <span>Fréquence: {med.frequency}</span>
                                        <span>Durée: {med.duration}</span>
                                        <span className="text-right">
                                            Confiance: {(med.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {analysis.warnings.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-orange-600">Avertissements:</h4>
                                {analysis.warnings.map((warning: string, index: number) => (
                                    <div key={index} className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded text-sm flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                                        <span>{warning}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {analysis.interactions.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-red-600">Interactions:</h4>
                                {analysis.interactions.map((interaction: string, index: number) => (
                                    <div key={index} className="bg-red-50 dark:bg-red-950/20 p-2 rounded text-sm">
                                        {interaction}
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button
                            onClick={() => {
                                setAnalysis(null);
                                setError(null);
                            }}
                            variant="outline"
                            className="w-full"
                        >
                            Analyser une autre ordonnance
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
