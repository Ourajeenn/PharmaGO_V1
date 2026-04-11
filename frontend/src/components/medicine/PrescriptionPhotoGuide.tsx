import { CheckCircle2, XCircle, Camera, Sun, FileText, Smartphone, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const PrescriptionPhotoGuide = () => {
    return (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Camera className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl tracking-tight text-slate-900">Guide de capture</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Optimisez l'analyse automatique</p>
                    </div>
                </div>
                <Button variant="ghost" className="hidden sm:flex rounded-xl text-primary font-bold hover:bg-primary/5 gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Tutoriel Vidéo
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* DO card - Premium Glass */}
                <Card className="glass-morphism border-emerald-500/20 bg-emerald-50/10 overflow-hidden group hover:border-emerald-500/40 transition-all duration-500">
                    <CardContent className="p-0 flex h-full">
                        <div className="w-[35%] bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center p-6 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="relative w-full aspect-[3/4] bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-3 flex flex-col items-center justify-center transform rotate-2 group-hover:rotate-0 transition-transform duration-500 border border-white/40">
                                <FileText className="h-10 w-10 text-emerald-600/40 mb-3" />
                                <div className="w-full space-y-1.5 px-1">
                                    <div className="w-full h-1.5 bg-emerald-100/50 rounded-full"></div>
                                    <div className="w-[80%] h-1.5 bg-emerald-100/50 rounded-full"></div>
                                    <div className="w-[90%] h-1.5 bg-emerald-100/50 rounded-full"></div>
                                </div>
                                <div className="absolute -top-3 -right-3">
                                    <div className="bg-emerald-500 text-white rounded-full p-1 shadow-lg shadow-emerald-200">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-[65%] p-6 flex flex-col justify-center">
                            <Badge variant="outline" className="w-fit mb-3 bg-emerald-100/50 text-emerald-700 border-emerald-200 uppercase text-[10px] font-black tracking-widest px-3">
                                Recommandé
                            </Badge>
                            <h4 className="font-bold text-slate-900 text-lg mb-4">Bonnes pratiques</h4>
                            <ul className="space-y-3">
                                {[
                                    { icon: Sun, text: "Éclairage naturel constant" },
                                    { icon: Smartphone, text: "Appareil stable & à plat" },
                                    { icon: FileText, text: "Cadrage complet 4/4" }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                            <item.icon className="h-3.5 w-3.5 text-emerald-600" />
                                        </div>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* DON'T card - Premium Glass */}
                <Card className="glass-morphism border-rose-500/20 bg-rose-50/10 overflow-hidden group hover:border-rose-500/40 transition-all duration-500">
                    <CardContent className="p-0 flex h-full">
                        <div className="w-[35%] bg-gradient-to-br from-rose-500/20 to-rose-600/5 flex items-center justify-center p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/5 backdrop-grayscale-[0.5]"></div>
                            <div className="relative w-full aspect-[3/4] bg-white/60 backdrop-blur-sm shadow-xl rounded-xl p-3 flex flex-col items-center justify-center transform -rotate-3 blur-[0.5px] opacity-80 group-hover:rotate-0 transition-transform duration-500 border border-white/20">
                                <FileText className="h-10 w-10 text-rose-600/20 mb-3" />
                                <div className="w-full space-y-1.5 px-1">
                                    <div className="w-full h-1.5 bg-rose-100/30 rounded-full"></div>
                                    <div className="w-[70%] h-1.5 bg-rose-100/30 rounded-full"></div>
                                </div>
                                <div className="absolute -bottom-3 -right-3">
                                    <div className="bg-rose-500 text-white rounded-full p-1 shadow-lg shadow-rose-200">
                                        <XCircle className="h-6 w-6" />
                                    </div>
                                </div>
                                {/* Flash glare */}
                                <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-white rounded-full blur-2xl opacity-60"></div>
                            </div>
                        </div>
                        <div className="w-[65%] p-6 flex flex-col justify-center">
                            <Badge variant="outline" className="w-fit mb-3 bg-rose-100/50 text-rose-700 border-rose-200 uppercase text-[10px] font-black tracking-widest px-3">
                                À éviter
                            </Badge>
                            <h4 className="font-bold text-slate-900 text-lg mb-4">Causes d'échec</h4>
                            <ul className="space-y-3">
                                {[
                                    { icon: "🌑", text: "Environnement sombre" },
                                    { icon: "⚡", text: "Reflets parasites du flash" },
                                    { icon: "✂️", text: "Texte tronqué ou flou" }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center border border-rose-100">
                                            <span className="text-[10px]">{item.icon}</span>
                                        </div>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
