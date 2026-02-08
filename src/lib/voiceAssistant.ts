// Voice Assistant for PharmaGo Express
import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface VoiceCommand {
    command: string;
    action: () => void;
    keywords: string[];
}

export class VoiceAssistant {
    private recognition: SpeechRecognition | null = null;
    private synthesis: SpeechSynthesis | null = null;
    private isListening: boolean = false;
    private commands: VoiceCommand[] = [];

    constructor() {
        // Initialize Speech Recognition
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'fr-FR'; // French language
            this.recognition.maxAlternatives = 1;
        }

        // Initialize Speech Synthesis
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }
    }

    // Check if voice features are supported
    isSupported(): boolean {
        return this.recognition !== null && this.synthesis !== null;
    }

    // Register a voice command
    registerCommand(command: VoiceCommand): void {
        this.commands.push(command);
    }

    // Start listening
    startListening(
        onResult: (transcript: string) => void,
        onError?: (error: string) => void
    ): void {
        if (!this.recognition) {
            onError?.('Reconnaissance vocale non supportée');
            return;
        }

        if (this.isListening) {
            return;
        }

        this.isListening = true;

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            logger.log('[Voice] Recognized:', transcript);
            onResult(transcript);
            this.processCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            logger.error('[Voice] Recognition error:', event.error);
            this.isListening = false;
            onError?.(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };

        this.recognition.start();
    }

    // Stop listening
    stopListening(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    // Process recognized command
    private processCommand(transcript: string): void {
        for (const cmd of this.commands) {
            const matches = cmd.keywords.some((keyword) =>
                transcript.includes(keyword.toLowerCase())
            );

            if (matches) {
                logger.log('[Voice] Executing command:', cmd.command);
                cmd.action();
                break;
            }
        }
    }

    // Speak text
    speak(text: string, lang: string = 'fr-FR'): void {
        if (!this.synthesis) {
            logger.error('[Voice] Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        this.synthesis.speak(utterance);
    }

    // Get available voices
    getVoices(): SpeechSynthesisVoice[] {
        if (!this.synthesis) return [];
        return this.synthesis.getVoices();
    }

    // Check if currently listening
    getIsListening(): boolean {
        return this.isListening;
    }
}

// React Hook for Voice Assistant
export const useVoiceAssistant = () => {
    const [assistant] = useState(() => new VoiceAssistant());
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const startListening = useCallback(() => {
        assistant.startListening(
            (text) => {
                setTranscript(text);
                setIsListening(false);
            },
            (err) => {
                setError(err);
                setIsListening(false);
            }
        );
        setIsListening(true);
        setError(null);
    }, [assistant]);

    const stopListening = useCallback(() => {
        assistant.stopListening();
        setIsListening(false);
    }, [assistant]);

    const speak = useCallback(
        (text: string) => {
            assistant.speak(text);
        },
        [assistant]
    );

    return {
        isSupported: assistant.isSupported(),
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        speak,
        registerCommand: assistant.registerCommand.bind(assistant),
    };
};

// Predefined commands for PharmaGo
export const PharmaGoCommands = {
    searchMedicine: (searchFn: (query: string) => void) => ({
        command: 'search_medicine',
        keywords: ['cherche', 'chercher', 'recherche', 'rechercher', 'trouve', 'trouver'],
        action: () => {
            // This will be handled in the component
        },
    }),

    findPharmacy: (navigate: (path: string) => void) => ({
        command: 'find_pharmacy',
        keywords: ['pharmacie', 'pharmacies', 'de garde', 'proche', 'près'],
        action: () => navigate('/pharmacies'),
    }),

    trackOrder: (navigate: (path: string) => void) => ({
        command: 'track_order',
        keywords: ['suivi', 'suivre', 'commande', 'livraison', 'où est'],
        action: () => navigate('/suivi'),
    }),

    viewCart: (navigate: (path: string) => void) => ({
        command: 'view_cart',
        keywords: ['panier', 'achats', 'cart', 'commander'],
        action: () => navigate('/panier'),
    }),

    goHome: (navigate: (path: string) => void) => ({
        command: 'go_home',
        keywords: ['accueil', 'home', 'retour', 'menu'],
        action: () => navigate('/'),
    }),
};
