import { CheckCircle2, XCircle, Camera, Sun, FileText, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const PrescriptionPhotoGuide = () => {
    return (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-4">
                <Camera className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">Comment prendre une bonne photo ?</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* DO card */}
                <Card className="bg-green-50 border-green-200 overflow-hidden">
                    <CardContent className="p-0 flex h-full">
                        <div className="w-1/3 bg-green-100 flex items-center justify-center p-4">
                            <div className="relative w-full aspect-[3/4] bg-white shadow-md rounded-lg p-2 flex flex-col items-center justify-center transform rotate-1">
                                <FileText className="h-8 w-8 text-gray-400 mb-2" />
                                <div className="w-12 h-1 bg-gray-200 rounded mb-1"></div>
                                <div className="w-10 h-1 bg-gray-200 rounded"></div>
                                <div className="absolute top-0 right-0 p-1">
                                    <CheckCircle2 className="h-6 w-6 text-green-500 fill-white" />
                                </div>
                            </div>
                        </div>
                        <div className="w-2/3 p-4">
                            <h4 className="font-bold text-green-700 flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4" /> BIEN
                            </h4>
                            <ul className="text-sm space-y-2 text-green-800">
                                <li className="flex items-start gap-2">
                                    <Sun className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
                                    Eclairage naturel (éviter le flash)
                                </li>
                                <li className="flex items-start gap-2">
                                    <Smartphone className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
                                    Tenir le téléphone bien à plat
                                </li>
                                <li className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
                                    Ordonnance entièrement visible
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* DON'T card */}
                <Card className="bg-red-50 border-red-200 overflow-hidden">
                    <CardContent className="p-0 flex h-full">
                        <div className="w-1/3 bg-red-100 flex items-center justify-center p-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10 z-0"></div>
                            <div className="relative w-full aspect-[3/4] bg-white shadow-md rounded-lg p-2 flex flex-col items-center justify-center transform -rotate-3 blur-[1px] opacity-80 z-10">
                                <FileText className="h-8 w-8 text-gray-400 mb-2" />
                                <div className="w-12 h-1 bg-gray-200 rounded mb-1"></div>
                                <div className="w-10 h-1 bg-gray-200 rounded"></div>
                                <div className="absolute -right-2 -bottom-2 p-1">
                                    <XCircle className="h-6 w-6 text-red-500 fill-white" />
                                </div>
                            </div>
                            {/* Flash reflection effect */}
                            <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white rounded-full blur-xl z-20"></div>
                        </div>
                        <div className="w-2/3 p-4">
                            <h4 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                                <XCircle className="h-4 w-4" /> À ÉVITER
                            </h4>
                            <ul className="text-sm space-y-2 text-red-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-lg leading-none mt-px">🌑</span>
                                    Photo sombre ou floue
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-lg leading-none mt-px">⚡</span>
                                    Reflets du flash sur le texte
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-lg leading-none mt-px">✂️</span>
                                    Texte coupé ou caché
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-4 flex justify-end">
                <Button variant="link" className="text-primary h-auto p-0 flex items-center gap-1 hover:no-underline hover:text-primary/80 transition-colors">
                    <span className="text-lg">🎥</span>
                    Voir tutoriel vidéo (30s)
                </Button>
            </div>
        </div>
    );
};
