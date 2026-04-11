import React from 'react';
import { useBiometricsContext } from '@/contexts/BiometricsContext';
import { Button } from '@/components/ui/button';
import { Fingerprint, Lock, ChevronRight, ScanFace } from 'lucide-react';

interface BiometricGuardProps {
    children: React.ReactNode;
}

export const BiometricGuard: React.FC<BiometricGuardProps> = ({ children }) => {
    const {
        isEnabled,
        isAuthenticated,
        isLoading,
        unlock
    } = useBiometricsContext();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If biometrics enabled but not authenticated, show Lock Screen
    if (isEnabled && !isAuthenticated) {
        return (
            <div className="h-screen w-full bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-between p-8 text-white relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                <div className="mt-20 flex flex-col items-center animate-in fade-in zoom-in duration-500 z-10">
                    <div className="relative">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/10 relative z-10">
                            <Lock className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-blue-400/30 blur-xl rounded-full animate-pulse"></div>
                    </div>

                    <h1 className="text-2xl font-bold mb-2 tracking-tight">PharmaGo Sécurisé</h1>
                    <p className="text-blue-100 text-center text-sm px-4">
                        Votre santé mérite une protection maximale.
                        <br />Application verrouillée.
                    </p>
                </div>

                <div className="w-full max-w-xs space-y-4 mb-12 z-10">
                    <Button
                        onClick={() => unlock()}
                        className="w-full h-14 bg-white text-blue-600 hover:bg-white/90 rounded-2xl text-lg font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 group"
                    >
                        <ScanFace className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                        Déverrouiller
                    </Button>

                    <button
                        className="w-full py-2 text-xs text-center text-blue-200 hover:text-white transition-colors flex items-center justify-center gap-1"
                    >
                        Utiliser mon code PIN <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="text-[10px] text-blue-300/50 absolute bottom-4 flex items-center gap-1">
                    <Fingerprint className="w-3 h-3" />
                    Protected by Medicore Security
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
