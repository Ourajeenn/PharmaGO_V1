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

            // 1. Simulation d'un challenge backend (Challenge Réel simulé)
            // En production, on appelle une Supabase Edge Function
            const fetchRegistrationOptions = async (): Promise<any> => {
                await new Promise(resolve => setTimeout(resolve, 800));
                return {
                    // Structure compatible avec startRegistration({ optionsJSON: ... })
                    challenge: 'Y2hhbGxlbmdl', // base64url encoded challenge
                    rp: { name: 'PharmaGo', id: window.location.hostname },
                    user: {
                        id: 'dXNlcmlk', // base64url encoded user id
                        name: userName,
                        displayName: userName,
                    },
                    pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
                    timeout: 60000,
                    attestation: 'none',
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                        residentKey: 'required',
                    },
                };
            };

            const optionsJSON = await fetchRegistrationOptions();
            const registrationResponse = await startRegistration({ optionsJSON });

            // 2. Simulation de sauvegarde dans Supabase (Sprint 30)
            const saveToSupabase = async (cred: any) => {
                console.log('Sending public key to Supabase Profile...', cred.id);
                // En production : await supabase.from('user_profiles').update({ webauthn_key: cred.id }).eq('id', user.id)
            };
            await saveToSupabase(registrationResponse);

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

            // SimpleWebAuthn browser expects JSON-like structure
            const fetchAuthOptions = async (): Promise<any> => {
                await new Promise(resolve => setTimeout(resolve, 800));
                return {
                    challenge: 'Y2hhbGxlbmdlX2F1dGg', // base64url
                    timeout: 60000,
                    userVerification: 'required',
                    rpId: window.location.hostname,
                    allowCredentials: [], // Optional: server can specify devices
                };
            };

            const optionsJSON = await fetchAuthOptions();
            const authResponse = await startAuthentication({ optionsJSON });

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
