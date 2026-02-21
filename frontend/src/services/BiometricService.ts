import {
    startRegistration,
    startAuthentication,
    browserSupportsWebAuthn,
} from '@simplewebauthn/browser';

/**
 * BiometricService - Gestionnaire Passkey pour PWA
 * Permet d'utiliser FaceID / TouchID / Empreinte
 */
export class BiometricService {
    /**
     * Vérifie si l'appareil supporte la biométrie (WebAuthn)
     */
    static isSupported(): boolean {
        return browserSupportsWebAuthn();
    }

    /**
     * Enregistre un nouvel appareil (Passkey)
     * Note: Normalement, le challenge est généré par le backend.
     * Pour cette démo/PWA, on peut simuler ou se connecter à Supabase si configuré.
     */
    static async registerBiometrics(userName: string): Promise<boolean> {
        try {
            if (!this.isSupported()) throw new Error('Biométrie non supportée');

            // 1. Simulation d'un challenge backend (A remplacer par un vrai appel API)
            // En production, vous feriez : const options = await fetch('/api/generate-registration-options')
            const options: any = {
                publicKey: {
                    challenge: new Uint8Array([1, 2, 3, 4]), // Dummy challenge
                    rp: { name: 'PharmaGo', id: window.location.hostname },
                    user: {
                        id: new Uint8Array([1, 2, 3, 4]),
                        name: userName,
                        displayName: userName,
                    },
                    pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
                    timeout: 60000,
                    attestation: 'none',
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform', // Oblige l'usage de FaceID/Fingerprint/PIN local
                        userVerification: 'required',
                        residentKey: 'required',
                    },
                },
            };

            const registrationResponse = await startRegistration(options.publicKey);

            // 2. Envoyer la réponse au backend pour vérification
            // await fetch('/api/verify-registration', { method: 'POST', body: JSON.stringify(registrationResponse) })

            console.log('Registration success:', registrationResponse);
            localStorage.setItem('biometrics_enrolled', 'true');
            return true;
        } catch (error) {
            console.error('Biometric registration failed:', error);
            return false;
        }
    }

    /**
     * Authentifie l'utilisateur via biométrie
     */
    static async authenticate(): Promise<boolean> {
        try {
            if (!this.isSupported()) return false;

            // 1. Demander des options d'authentification au backend
            const options: any = {
                publicKey: {
                    challenge: new Uint8Array([5, 6, 7, 8]), // Dummy challenge
                    timeout: 60000,
                    userVerification: 'required',
                    rpId: window.location.hostname,
                },
            };

            const authResponse = await startAuthentication(options.publicKey);

            // 2. Vérifier la signature côté backend
            console.log('Authentication success:', authResponse);
            return true;
        } catch (error) {
            console.error('Biometric authentication failed:', error);
            return false;
        }
    }

    /**
     * Vérifie si l'utilisateur a déjà activé la biométrie localement
     */
    static isEnrolled(): boolean {
        return localStorage.getItem('biometrics_enrolled') === 'true';
    }
}

export default BiometricService;
