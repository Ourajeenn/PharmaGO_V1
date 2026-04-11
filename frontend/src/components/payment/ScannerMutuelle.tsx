import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle2, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { scanInsuranceCard, OCRInsuranceResult } from '@/services/ocrService';

interface ScannerMutuelleProps {
    onScanComplete: (cardNumber: string, company: string | null) => void;
}

export const ScannerMutuelle: React.FC<ScannerMutuelleProps> = ({ onScanComplete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) stopCamera();
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            if (stream) stream.getTracks().forEach(track => track.stop());
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
                description: "Impossible d'accéder à l'appareil photo.",
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
                        const file = new File([blob], "mutuelle_scan.jpg", { type: "image/jpeg" });
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
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setIsScanning(true);
        setScanProgress(0);

        try {
            const minWait = new Promise(resolve => setTimeout(resolve, 2000));
            const scanPromise = scanInsuranceCard(file, setScanProgress);
            const [result] = await Promise.all([scanPromise, minWait]);

            if (result.cardNumber) {
                toast({
                    title: "Carte détectée !",
                    description: `Numéro trouvé : ${result.cardNumber}`,
                });
                onScanComplete(result.cardNumber, result.company);
                setIsOpen(false);
            } else {
                toast({
                    title: "Aucun numéro détecté",
                    description: "Assurez-vous que la carte est bien éclairée et lisible.",
                    variant: "destructive"
                });
                setPreviewUrl(null); // retry
            }
        } catch (error) {
            toast({
                title: "Erreur de scan",
                description: "Le scan a échoué. Veuillez réessayer.",
                variant: "destructive"
            });
            setPreviewUrl(null);
        } finally {
            setIsScanning(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        processFile(file);
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="flex gap-2">
                <Camera className="w-4 h-4" /> Scanner
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Scanner votre carte de mutuelle
                        </DialogTitle>
                        <DialogDescription>
                            Prenez en photo votre carte pour extraire automatiquement votre numéro d'assuré.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {!isScanning && !previewUrl && !isCameraOpen && (
                            <div className="flex flex-col gap-3">
                                <Button onClick={startCamera} className="w-full" size="lg">
                                    <Camera className="mr-2 h-5 w-5" /> Utiliser l'appareil photo
                                </Button>
                                <div className="text-center text-sm text-slate-500">ou</div>
                                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                                    <Upload className="mr-2 h-5 w-5" /> Importer une photo
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                />
                            </div>
                        )}

                        {isCameraOpen && (
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                                <div className="absolute inset-0 border-2 border-white/20 pointer-events-none">
                                    <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border-2 border-primary border-dashed rounded-md bg-white/5" />
                                </div>
                                <div className="absolute bottom-4 left-0 right-0 gap-4 flex justify-center">
                                    <Button variant="secondary" size="icon" onClick={toggleCamera} className="rounded-full bg-white/20 backdrop-blur">
                                        <RefreshCcw className="h-5 w-5 text-white" />
                                    </Button>
                                    <Button onClick={capturePhoto} size="lg" className="rounded-full h-14 px-8 font-bold shadow-xl">
                                        Capturer
                                    </Button>
                                </div>
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                        )}

                        {previewUrl && (
                            <div className="space-y-4">
                                <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                                    <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                                    {isScanning && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4" />
                                            <h3 className="font-bold text-lg">Analyse en cours...</h3>
                                            <Progress value={scanProgress} className="w-full mt-4 bg-white/20" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
