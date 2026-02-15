import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Activity, Brain, Eye, Heart, PersonStanding } from "lucide-react";
// import { Button } from "@/components/ui/button"; // Unused import removal

const bodyParts = [
    { id: 'full', label: 'Corps', icon: PersonStanding },
    { id: 'heart', label: 'Cœur', icon: Heart },
    { id: 'brain', label: 'Cerveau', icon: Brain },
    { id: 'eyes', label: 'Yeux', icon: Eye },
];

export const BodyMapWidget = () => {
    const [selectedPart, setSelectedPart] = useState('brain');

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm h-full flex flex-col overflow-hidden relative">
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Rapport Médical</h3>
                    <p className="text-xs text-muted-foreground mt-1">Détails centralisés des opérations</p>
                </div>
            </div>

            {/* Body Part Selector */}
            <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                {bodyParts.map((part) => {
                    const Icon = part.icon;
                    const isSelected = selectedPart === part.id;
                    return (
                        <button
                            key={part.id}
                            onClick={() => setSelectedPart(part.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border",
                                isSelected
                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                                    : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                            )}
                        >
                            <Icon className="h-3 w-3" />
                            {part.label}
                        </button>
                    )
                })}
            </div>

            {/* Main Visual Content (Mock) */}
            <div className="flex-1 bg-gradient-to-b from-gray-50 to-white rounded-3xl relative overflow-hidden flex items-center justify-center border border-gray-100">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-20"></div>

                {selectedPart === 'brain' && (
                    <div className="relative w-full h-full p-4 flex items-center justify-center animate-in fade-in zoom-in duration-500">
                        {/* Abstract Brain Visual */}
                        <div className="relative z-10">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                            <Brain className="h-40 w-40 text-blue-600 relative z-10 drop-shadow-2xl" strokeWidth={1.5} />

                            {/* Pulse points */}
                            <span className="absolute top-10 right-10 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                        </div>

                        {/* Floating info card */}
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 text-xs flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Activity className="h-3 w-3 text-orange-500" />
                                    <span className="font-bold text-gray-700">Activité Neuro</span>
                                </div>
                                <p className="text-gray-400 font-medium">Stable</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-2xl text-gray-900">98%</p>
                            </div>
                        </div>
                    </div>
                )}
                {selectedPart === 'heart' && (
                    <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-500">
                        <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full"></div>
                        <Heart className="h-32 w-32 text-red-500 drop-shadow-2xl animate-pulse" strokeWidth={1} />
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 text-xs flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-700">Rythme Cardiaque</p>
                                <p className="text-gray-400 font-medium">Normal</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-2xl text-gray-900">72 <span className="text-xs text-gray-400 font-normal">bpm</span></p>
                            </div>
                        </div>
                    </div>
                )}
                {selectedPart === 'full' && (
                    <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-500">
                        <PersonStanding className="h-48 w-48 text-gray-300" strokeWidth={1} />
                    </div>
                )}
                {selectedPart === 'eyes' && (
                    <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-500">
                        <Eye className="h-32 w-32 text-emerald-500 opacity-80" strokeWidth={1} />
                    </div>
                )}
            </div>
        </div>
    );
};
