import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Smartphone, Lock, Loader2 } from 'lucide-react';

interface USSDSimulatorProps {
    open: boolean;
    provider: string;
    phoneNumber: string;
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

type USSDStep = 'dial' | 'connecting' | 'confirm' | 'pin' | 'processing' | 'success';

const providerConfig: Record<string, { name: string; color: string; ussd: string; gradient: string }> = {
    orange_money: {
        name: 'Orange Money',
        color: '#FF6600',
        ussd: '*144#',
        gradient: 'from-orange-500 to-orange-600',
    },
    wave: {
        name: 'Wave',
        color: '#1DC3E2',
        ussd: '*222#',
        gradient: 'from-cyan-500 to-blue-500',
    },
    mtn_money: {
        name: 'MTN Mobile Money',
        color: '#FFCC00',
        ussd: '*133#',
        gradient: 'from-yellow-400 to-yellow-500',
    },
    moov_money: {
        name: 'Moov Money',
        color: '#0066CC',
        ussd: '*155#',
        gradient: 'from-blue-500 to-blue-700',
    },
};

export const USSDSimulator = ({
    open,
    provider,
    phoneNumber,
    amount,
    onSuccess,
    onCancel,
}: USSDSimulatorProps) => {
    const [step, setStep] = useState<USSDStep>('dial');
    const [pin, setPin] = useState('');
    const [dots, setDots] = useState('');
    const config = providerConfig[provider] || providerConfig.orange_money;

    // Reset on open
    useEffect(() => {
        if (open) {
            setStep('dial');
            setPin('');
            setDots('');
        }
    }, [open]);

    // Auto-advance from dial → connecting → confirm
    useEffect(() => {
        if (!open) return;
        let timer: ReturnType<typeof setTimeout>;

        if (step === 'dial') {
            timer = setTimeout(() => setStep('connecting'), 1500);
        } else if (step === 'connecting') {
            timer = setTimeout(() => setStep('confirm'), 2000);
        } else if (step === 'processing') {
            timer = setTimeout(() => setStep('success'), 2500);
        } else if (step === 'success') {
            timer = setTimeout(() => onSuccess(), 2000);
        }

        return () => clearTimeout(timer);
    }, [step, open, onSuccess]);

    // Dots animation for connecting
    useEffect(() => {
        if (step !== 'connecting') return;
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, [step]);

    const handlePinDigit = useCallback((digit: string) => {
        setPin(prev => {
            const newPin = prev + digit;
            if (newPin.length >= 4) {
                setTimeout(() => setStep('processing'), 300);
            }
            return newPin.slice(0, 4);
        });
    }, []);

    const handlePinDelete = useCallback(() => {
        setPin(prev => prev.slice(0, -1));
    }, []);

    const renderKeypad = () => {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
        return (
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                {keys.map((key, i) => {
                    if (key === '') return <div key={i} />;
                    return (
                        <button
                            key={i}
                            onClick={() => key === '⌫' ? handlePinDelete() : handlePinDigit(key)}
                            className="h-12 w-full rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 
                         font-bold text-lg transition-all active:scale-95 select-none"
                        >
                            {key}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && step !== 'processing' && step !== 'success' && onCancel()}>
            <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
                {/* Phone Header */}
                <div className={`bg-gradient-to-r ${config.gradient} p-4 text-white`}>
                    <div className="flex items-center gap-2 text-sm opacity-80">
                        <Smartphone className="h-4 w-4" />
                        <span>{config.name}</span>
                    </div>
                    <div className="text-lg font-mono font-bold mt-1">
                        {phoneNumber || '+225 XX XX XX XX'}
                    </div>
                </div>

                {/* USSD Screen */}
                <div className="bg-slate-900 text-green-400 font-mono p-6 min-h-[220px] flex flex-col justify-center">
                    {/* Step: DIAL */}
                    {step === 'dial' && (
                        <div className="text-center space-y-3 animate-in fade-in duration-300">
                            <p className="text-xs text-slate-500">USSD REQUEST</p>
                            <p className="text-2xl font-bold tracking-wider animate-pulse">{config.ussd}</p>
                            <p className="text-xs text-slate-500">Envoi en cours...</p>
                        </div>
                    )}

                    {/* Step: CONNECTING */}
                    {step === 'connecting' && (
                        <div className="text-center space-y-3 animate-in fade-in duration-300">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-400" />
                            <p className="text-sm">Connexion à {config.name}{dots}</p>
                        </div>
                    )}

                    {/* Step: CONFIRM */}
                    {step === 'confirm' && (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            <p className="text-xs text-slate-500 text-center">— {config.name} —</p>
                            <div className="bg-slate-800 rounded-lg p-3 space-y-2 text-sm">
                                <p>Paiement à:</p>
                                <p className="text-white font-bold">PharmaGo Express</p>
                                <div className="border-t border-slate-700 pt-2 mt-2">
                                    <p>Montant:</p>
                                    <p className="text-xl font-bold text-yellow-400">
                                        {amount.toLocaleString('fr-FR')} FCFA
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                    onClick={onCancel}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                                    onClick={() => setStep('pin')}
                                >
                                    Confirmer
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step: PIN */}
                    {step === 'pin' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="text-center">
                                <Lock className="h-5 w-5 mx-auto mb-2 text-yellow-400" />
                                <p className="text-sm text-slate-400">Entrez votre code secret</p>
                            </div>
                            <div className="flex justify-center gap-3">
                                {[0, 1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl
                      ${pin.length > i
                                                ? 'border-green-400 bg-green-400/20'
                                                : 'border-slate-600 bg-slate-800'
                                            } transition-all duration-200`}
                                    >
                                        {pin.length > i ? '•' : ''}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step: PROCESSING */}
                    {step === 'processing' && (
                        <div className="text-center space-y-3 animate-in fade-in duration-300">
                            <div className="relative mx-auto w-12 h-12">
                                <div className="absolute inset-0 rounded-full border-2 border-green-400/30" />
                                <div className="absolute inset-0 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
                            </div>
                            <p className="text-sm">Validation en cours...</p>
                            <p className="text-xs text-slate-500">Ne fermez pas cette fenêtre</p>
                        </div>
                    )}

                    {/* Step: SUCCESS */}
                    {step === 'success' && (
                        <div className="text-center space-y-3 animate-in zoom-in duration-500">
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-400" />
                            </div>
                            <p className="text-lg font-bold text-green-400">Transaction réussie !</p>
                            <p className="text-sm text-slate-400">
                                {amount.toLocaleString('fr-FR')} FCFA envoyés
                            </p>
                            <p className="text-xs text-slate-600">Réf: TXN-{Date.now().toString(36).toUpperCase()}</p>
                        </div>
                    )}
                </div>

                {/* Keypad (only for PIN step) */}
                {step === 'pin' && (
                    <div className="p-4 bg-white">
                        {renderKeypad()}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default USSDSimulator;
