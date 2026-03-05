import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, AlertTriangle, FileText, Loader2, Edit2, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { scanPrescription, ParsedMedication } from '@/services/ocrService';
// Import or mock your local product Database matching function here.
// For now, we'll map parsed results to generic mock products.

const ScannerOrdonnance = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [results, setResults] = useState<ParsedMedication[] | null>(null);
    const [confidence, setConfidence] = useState<number>(100);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { toast } = useToast();
    const { dispatch } = useCart();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Show preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Start scanning
        setIsScanning(true);
        setScanProgress(0);
        setResults(null);

        try {
            // Artificial delay to show the cool scanning animation as requested (2-4 sec)
            const minWait = new Promise(resolve => setTimeout(resolve, 2500));

            const scanPromise = scanPrescription(file, (progress) => {
                setScanProgress(progress);
            });

            const [result] = await Promise.all([scanPromise, minWait]);

            setResults(result.medications);
            setConfidence(result.overallConfidence);

            if (result.overallConfidence < 70) {
                toast({
                    title: "Confiance de lecture faible",
                    description: "Nous n'avons pas pu lire l'ordonnance avec certitude. Veuillez vérifier et corriger les éléments.",
                    variant: "destructive"
                });
            }

        } catch (error) {
            toast({
                title: "Erreur de scan",
                description: "Une erreur est survenue lors de l'analyse de l'ordonnance.",
                variant: "destructive"
            });
        } finally {
            setIsScanning(false);
        }
    };

    const handleUpdateMedication = (index: number, field: keyof ParsedMedication, value: string | number) => {
        if (!results) return;
        const newResults = [...results];
        newResults[index] = { ...newResults[index], [field]: value };
        setResults(newResults);
    };

    const handleRemoveMedication = (index: number) => {
        if (!results) return;
        const newResults = [...results];
        newResults.splice(index, 1);
        setResults(newResults);
    };

    const handleAddEmptyMedication = () => {
        if (!results) return;
        setResults([...results, { name: '', rawText: '', confidence: 100, quantity: 1 }]);
    };

    const handleConfirmToCart = () => {
        if (!results) return;

        // Add to cart Context
        results.forEach(med => {
            if (med.name.trim() === '') return;
            // Map to a mock product layout fitting the CartItem requirement
            dispatch({
                type: 'ADD_ITEM',
                payload: {
                    id: `med-scan-${Date.now()}-${Math.random()}`,
                    name: med.name,
                    price: 2500, // Mock price
                    quantity: med.quantity || 1,
                    category: 'Ordonnance',
                    requiresPrescription: true,
                    description: med.dosage || 'Dosage non spécifié'
                }
            });
        });

        toast({
            title: "Panier mis à jour",
            description: `${results.length} médicament(s) ajouté(s) au panier ✓. En attente de validation pharmacien.`,
        });

        setIsOpen(false);
        // Reset state
        setTimeout(() => {
            setResults(null);
            setPreviewUrl(null);
            setConfidence(100);
            setScanProgress(0);
        }, 500);
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-8 py-6 text-lg font-bold flex items-center gap-3 shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all hover:scale-105 hover:shadow-[0_6px_25px_rgba(37,211,102,0.6)]"
            >
                <Camera className="h-6 w-6" />
                Scanner une ordonnance
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <FileText className="h-6 w-6 text-primary" />
                            Analyse d'Ordonnance IA
                        </DialogTitle>
                        <DialogDescription>
                            Photographiez votre ordonnance. Notre IA identifiera les médicaments et préparera votre commande.
                        </DialogDescription>
                    </DialogHeader>

                    {!isScanning && !results && (
                        <div
                            className="border-2 border-dashed border-primary/30 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/5 transition-colors group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Prendre en photo ou importer</h3>
                            <p className="text-sm text-muted-foreground">Formats acceptés: JPG, PNG</p>
                            <Button className="mt-6 rounded-full" variant="outline">
                                Choisir une image
                            </Button>
                        </div>
                    )}

                    {isScanning && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                {/* Simulated scanning laser / overlay */}
                                {previewUrl && (
                                    <div className="relative w-64 h-80 rounded-lg overflow-hidden border">
                                        <img src={previewUrl} alt="ordonnance" className="w-full h-full object-cover opacity-50" />
                                        <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(var(--primary),1)] animate-[scan_2s_ease-in-out_infinite]" />
                                    </div>
                                )}
                                {!previewUrl && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
                            </div>
                            <div className="w-full max-w-sm space-y-2 text-center">
                                <h3 className="font-semibold text-lg text-primary animate-pulse">
                                    Lecture de l'ordonnance par l'IA...
                                </h3>
                                <Progress value={scanProgress} className="h-2 w-full" />
                                <p className="text-sm text-muted-foreground">{scanProgress}% complété</p>
                            </div>
                        </div>
                    )}

                    {results && !isScanning && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                                <div className="flex items-center gap-3">
                                    {confidence > 70 ? (
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    ) : (
                                        <AlertTriangle className="h-8 w-8 text-amber-500" />
                                    )}
                                    <div>
                                        <h4 className="font-bold flex items-center gap-2">
                                            Résultat de l'analyse
                                            <Badge variant={confidence > 70 ? "default" : "destructive"} className="ml-2">
                                                Confiance: {Math.round(confidence)}%
                                            </Badge>
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Vérifiez et ajustez les correspondances trouvées.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {results.length === 0 && (
                                    <div className="text-center py-6 text-muted-foreground">
                                        Aucun médicament détecté. Veuillez l'ajouter manuellement ou recommencer avec une photo plus nette.
                                    </div>
                                )}

                                {results.map((med, index) => (
                                    <div key={index} className="flex gap-3 items-start p-3 border rounded-lg hover:shadow-sm transition-shadow bg-card">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    value={med.name}
                                                    onChange={(e) => handleUpdateMedication(index, 'name', e.target.value)}
                                                    placeholder="Nom du médicament"
                                                    className="font-semibold"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={med.dosage || ''}
                                                    onChange={(e) => handleUpdateMedication(index, 'dosage', e.target.value)}
                                                    placeholder="Dosage (ex: 500mg)"
                                                    className="w-1/2 text-sm"
                                                />
                                                <Input
                                                    type="number"
                                                    value={med.quantity || 1}
                                                    onChange={(e) => handleUpdateMedication(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    min="1"
                                                    className="w-1/2 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveMedication(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button variant="outline" className="w-full" onClick={handleAddEmptyMedication}>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un médicament non détecté
                            </Button>

                            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-md text-sm flex items-center gap-2 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>Panier soumis à validation par un pharmacien diplômé avant confirmation.</span>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="ghost" onClick={() => setIsOpen(false)}>Annuler</Button>
                                <Button onClick={handleConfirmToCart} className="bg-primary hover:bg-primary/90">
                                    Valider et ajouter au panier
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ScannerOrdonnance;
