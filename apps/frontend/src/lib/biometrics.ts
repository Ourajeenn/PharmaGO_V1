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
        // Simulation for Localhost if hardware not available (and no API connection)
        if (this.isLocalhost() && !(await this.isPlatformAuthenticatorAvailable())) {
            try {
                // Try to ping API, if fails, fallback to pure mock
                const healthy = await fetch('http://localhost:5000/api/health').then(r => r.ok).catch(() => false);
                if (!healthy) throw new Error('API unreachable');
            } catch {
                console.log('[Biometrics] API Unreachable - Using Local Simulation');
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockCred = {
                    id: `mock-cred-${Date.now()}`,
                    publicKey: 'mock-public-key',
                    counter: 0
                };
                this.storeCredentialId(userId, mockCred.id);
                return mockCred;
            }
        }

        if (!this.isSupported()) {
            throw new Error('WebAuthn n\'est pas supporté sur cet appareil');
        }

        try {
            // 1. Get Challenge from API
            const challengeResponse = await fetch('http://localhost:5000/api/auth/register-challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, username: userName })
            });

            if (!challengeResponse.ok) throw new Error('Erreur lors de l\'initialisation biometrique');
            const options = await challengeResponse.json();

            // 2. Decode options for navigator (Base64URL -> Buffer)
            const publicKeyOptions: PublicKeyCredentialCreationOptions = {
                ...options,
                challenge: this.base64UrlToBuffer(options.challenge),
                user: {
                    ...options.user,
                    id: this.base64UrlToBuffer(options.user.id)
                }
            };

            // 3. Create Credential
            const credential = await navigator.credentials.create({
                publicKey: publicKeyOptions,
            }) as PublicKeyCredential;

            if (!credential) throw new Error('Aucune credential créée');

            // 4. Encode response for API (Buffer -> Base64URL)
            const response = credential.response as AuthenticatorAttestationResponse;
            const credentialData = {
                id: credential.id,
                rawId: this.bufferToBase64Url(credential.rawId),
                type: credential.type,
                response: {
                    clientDataJSON: this.bufferToBase64Url(response.clientDataJSON),
                    attestationObject: this.bufferToBase64Url(response.attestationObject)
                }
            };

            // 5. Verify at API
            const verifyResponse = await fetch('http://localhost:5000/api/auth/register-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, credential: credentialData })
            });

            if (!verifyResponse.ok) throw new Error('Échec de la validation biométrique');

            // Success
            this.storeCredentialId(userId, credential.id);

            return {
                id: credential.id,
                publicKey: 'server-stored',
                counter: 0
            };

        } catch (error: any) {
            console.error('[Biometrics] Registration error:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    // Authenticate with biometrics
    async authenticate(userId: string): Promise<boolean> {
        // Simulation for Localhost
        if (this.isLocalhost() && !(await this.isPlatformAuthenticatorAvailable())) {
            try {
                const healthy = await fetch('http://localhost:5000/api/health').then(r => r.ok).catch(() => false);
                if (!healthy) return true; // Fallback to mock success
            } catch {
                return true;
            }
        }

        if (!this.isSupported()) {
            throw new Error('WebAuthn n\'est pas supporté sur cet appareil');
        }

        try {
            // 1. Get Challenge
            const challengeResponse = await fetch('http://localhost:5000/api/auth/login-challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (challengeResponse.status === 404) throw new Error('Utilisateur non enrôlé pour la biométrie');
            if (!challengeResponse.ok) throw new Error('Erreur d\'initialisation');

            const options = await challengeResponse.json();

            // 2. Decode options
            const publicKeyOptions: PublicKeyCredentialRequestOptions = {
                ...options,
                challenge: this.base64UrlToBuffer(options.challenge),
                allowCredentials: options.allowCredentials?.map((c: any) => ({
                    ...c,
                    id: this.base64UrlToBuffer(c.id)
                }))
            };

            // 3. Get Assertion
            const credential = await navigator.credentials.get({
                publicKey: publicKeyOptions,
            }) as PublicKeyCredential;

            if (!credential) throw new Error('Authentification échouée');

            // 4. Encode response
            const response = credential.response as AuthenticatorAssertionResponse;
            const credentialData = {
                id: credential.id,
                rawId: this.bufferToBase64Url(credential.rawId),
                type: credential.type,
                response: {
                    clientDataJSON: this.bufferToBase64Url(response.clientDataJSON),
                    authenticatorData: this.bufferToBase64Url(response.authenticatorData),
                    signature: this.bufferToBase64Url(response.signature),
                    userHandle: response.userHandle ? this.bufferToBase64Url(response.userHandle) : null
                }
            };

            // 5. Verify at API
            const verifyResponse = await fetch('http://localhost:5000/api/auth/login-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, credential: credentialData })
            });

            if (!verifyResponse.ok) throw new Error('Validation échouée');

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
    private isLocalhost(): boolean {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    private async isPlatformAuthenticatorAvailable(): Promise<boolean> {
        if (!this.isSupported()) return false;
        try {
            return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch {
            return false;
        }
    }

    private base64UrlToBuffer(base64url: string): Uint8Array {
        const padding = '='.repeat((4 - base64url.length % 4) % 4);
        const base64 = (base64url + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    private bufferToBase64Url(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
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
            return error.message || 'Erreur d\'authentification biométrique';
        }
    }
}

export const biometrics = new BiometricsManager();
export default biometrics;
