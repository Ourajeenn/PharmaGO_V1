// Biometrics Authentication Library for PharmaGo Express

export interface BiometricCredential {
    id: string;
    publicKey: string;
    counter: number;
}

class BiometricsManager {
    private readonly rpName = 'PharmaGo Express';
    private readonly rpId = window.location.hostname;

    // Check if WebAuthn is supported
    isSupported(): boolean {
        return (
            window.PublicKeyCredential !== undefined &&
            navigator.credentials !== undefined
        );
    }

    // Check available authenticator types
    async getAvailableAuthenticators(): Promise<{
        platformAuthenticator: boolean;
        crossPlatformAuthenticator: boolean;
    }> {
        if (!this.isSupported()) {
            return {
                platformAuthenticator: false,
                crossPlatformAuthenticator: false,
            };
        }

        try {
            const platformAuth = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

            return {
                platformAuthenticator: platformAuth,
                crossPlatformAuthenticator: true, // Usually available if WebAuthn is supported
            };
        } catch (error) {
            console.error('[Biometrics] Error checking authenticators:', error);
            return {
                platformAuthenticator: false,
                crossPlatformAuthenticator: false,
            };
        }
    }

    // Register biometric credential
    async register(userId: string, userName: string): Promise<BiometricCredential> {
        if (!this.isSupported()) {
            throw new Error('WebAuthn n\'est pas supporté sur cet appareil');
        }

        // Generate challenge (in production, this should come from server)
        const challenge = this.generateChallenge();

        const publicKeyOptions: PublicKeyCredentialCreationOptions = {
            challenge,
            rp: {
                name: this.rpName,
                id: this.rpId,
            },
            user: {
                id: this.stringToBuffer(userId),
                name: userName,
                displayName: userName,
            },
            pubKeyCredParams: [
                { type: 'public-key', alg: -7 }, // ES256
                { type: 'public-key', alg: -257 }, // RS256
            ],
            authenticatorSelection: {
                authenticatorAttachment: 'platform', // Platform authenticator (e.g., Touch ID, Face ID, Windows Hello)
                userVerification: 'required',
                requireResidentKey: false,
            },
            timeout: 60000,
            attestation: 'none',
        };

        try {
            const credential = await navigator.credentials.create({
                publicKey: publicKeyOptions,
            }) as PublicKeyCredential;

            if (!credential) {
                throw new Error('Aucune credential créée');
            }

            const response = credential.response as AuthenticatorAttestationResponse;

            // In production, send this to server for storage
            const biometricCredential: BiometricCredential = {
                id: credential.id,
                publicKey: this.bufferToBase64(response.getPublicKey()!),
                counter: 0,
            };

            // Store credential ID locally (server should store full credential)
            this.storeCredentialId(userId, credential.id);

            return biometricCredential;
        } catch (error: any) {
            console.error('[Biometrics] Registration error:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    // Authenticate with biometrics
    async authenticate(userId: string): Promise<boolean> {
        if (!this.isSupported()) {
            throw new Error('WebAuthn n\'est pas supporté sur cet appareil');
        }

        // Get stored credential ID
        const credentialId = this.getCredentialId(userId);
        if (!credentialId) {
            throw new Error('Aucune credential enregistrée pour cet utilisateur');
        }

        // Generate challenge (in production, this should come from server)
        const challenge = this.generateChallenge();

        const publicKeyOptions: PublicKeyCredentialRequestOptions = {
            challenge,
            rpId: this.rpId,
            allowCredentials: [
                {
                    type: 'public-key',
                    id: this.base64ToBuffer(credentialId),
                },
            ],
            userVerification: 'required',
            timeout: 60000,
        };

        try {
            const credential = await navigator.credentials.get({
                publicKey: publicKeyOptions,
            }) as PublicKeyCredential;

            if (!credential) {
                throw new Error('Authentification échouée');
            }

            // In production, verify signature on server
            return true;
        } catch (error: any) {
            console.error('[Biometrics] Authentication error:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    // Remove biometric credential
    async removeCredential(userId: string): Promise<void> {
        localStorage.removeItem(`biometric_credential_${userId}`);
    }

    // Check if user has biometric credential registered
    hasCredential(userId: string): boolean {
        return localStorage.getItem(`biometric_credential_${userId}`) !== null;
    }

    // Helper methods
    private generateChallenge(): Uint8Array {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return array;
    }

    private stringToBuffer(str: string): Uint8Array {
        return new TextEncoder().encode(str);
    }

    private bufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    private base64ToBuffer(base64: string): Uint8Array {
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    private storeCredentialId(userId: string, credentialId: string): void {
        localStorage.setItem(`biometric_credential_${userId}`, credentialId);
    }

    private getCredentialId(userId: string): string | null {
        return localStorage.getItem(`biometric_credential_${userId}`);
    }

    private getErrorMessage(error: any): string {
        if (error.name === 'NotAllowedError') {
            return 'Authentification annulée';
        } else if (error.name === 'InvalidStateError') {
            return 'Credential déjà enregistrée';
        } else if (error.name === 'NotSupportedError') {
            return 'Méthode d\'authentification non supportée';
        } else {
            return 'Erreur d\'authentification biométrique';
        }
    }
}

export const biometrics = new BiometricsManager();
export default biometrics;
