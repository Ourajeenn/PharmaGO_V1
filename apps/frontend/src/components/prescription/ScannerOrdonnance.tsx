import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle2, AlertTriangle, FileText, Loader2, Edit2, Plus, Trash2, X, RefreshCcw } from 'lucide-react';
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
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

    const { toast } = useToast();
    const { addToCart } = useCart();

    // Clean up on unmount or modal close
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            setStream(mediaStream);
            setIsCameraOpen(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play().catch(() => { });
            }
        } catch (err) {
            toast({
                title: "Erreur Caméra",
                description: "Impossible d'accéder à l'appareil photo. Vérifiez les permissions de votre navigateur.",
                variant: "destructive"
            });
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "ordonnance_scan.jpg", { type: "image/jpeg" });
                        stopCamera();
                        processFile(file);
                    }
                }, "image/jpeg", 0.9);
            }
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === "environment" ? "user" : "environment");
        setTimeout(startCamera, 100);
    };

    const processFile = async (file: File) => {
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

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        processFile(file);
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
            addToCart({
                medicine: {
                    id: `med-scan-${Date.now()}-${Math.random()}`,
                    name: med.name,
                    description: med.dosage || 'Dosage non spécifié',
                    category: 'Ordonnance',
                    requires_prescription: true,
                    dosage: med.dosage || '',
                    form: '',
                    manufacturer: '',
                    generic_name: '',
                    created_at: '',
                    updated_at: ''
                },
                quantity: med.quantity || 1,
                pharmacy_id: 'mock-pharmacy',
                pharmacy_name: 'Pharmacie de Garde',
                price: 2500
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

                    {!isScanning && !results && !isCameraOpen && (
                        <div className="flex flex-col md:flex-row gap-4">
                            <div
                                className="flex-1 border-2 border-dashed border-primary/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/5 transition-colors group"
                                onClick={startCamera}
                            >
                                <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <Camera className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Scanner en direct</h3>
                                <p className="text-sm text-muted-foreground mb-4">Utiliser la caméra (recommandé)</p>
                                <Button className="rounded-full pointer-events-none">Ouvrir l'appareil photo</Button>
                            </div>
                            <div
                                className="flex-1 border-2 border-dashed border-emerald-500/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-500/5 transition-colors group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div className="bg-emerald-500/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-10 w-10 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Téléverser une image</h3>
                                <p className="text-sm text-muted-foreground mb-4">Depuis votre galerie photo</p>
                                <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 pointer-events-none">Choisir une image</Button>
                            </div>
                        </div>
                    )}

                    {isCameraOpen && (
                        <div className="relative rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover min-h-[300px] sm:min-h-[400px]"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Camera Controls Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                                <Button variant="ghost" size="icon" onClick={stopCamera} className="text-white hover:bg-white/20 rounded-full h-12 w-12 flex-shrink-0">
                                    <X className="h-6 w-6" />
                                </Button>

                                <Button onClick={capturePhoto} className="h-16 w-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 flex-shrink-0 animate-pulse border-white/80" />

                                <Button variant="ghost" size="icon" onClick={toggleCamera} className="text-white hover:bg-white/20 rounded-full h-12 w-12 flex-shrink-0">
                                    <RefreshCcw className="h-6 w-6" />
                                </Button>
                            </div>
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                                <Badge className="bg-black/50 text-white border-white/20 font-bold px-3 py-1">Cadrer l'ordonnance</Badge>
                            </div>
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
