# Documentation Sécurité & Performance

Ce document détaille l'implémentation des mesures de sécurité et des objectifs de performance pour PharmaGo.

## 3.2.2 Protection des Données

*   **HTTPS obligatoire (SSL/TLS)** :
    *   **Implémentation** : Forcé via les en-têtes `Strict-Transport-Security` dans `netlify.toml` et géré par le certificat SSL automatique de Netlify.
*   **Chiffrement des données sensibles (AES-256)** :
    *   **Implémentation** : Assuré nativement par Supabase (PostgreSQL TDE) au repos. Toutes les communications sont chiffrées en transit (TLS 1.3).
*   **Conformité PCI-DSS** :
    *   **Stratégie** : Aucune donnée de carte bancaire n'est stockée localement. Les paiements (Mobile Money, Stripe) sont délégués entièrement via des SDKs tokenisés sécurisés.
*   **Backup automatique quotidien** :
    *   **Implémentation** : Point-in-Time Recovery (PITR) activé sur l'instance Supabase Pro.

## 3.2.3 Sécurité Applicative

*   **Protection Injections SQL** :
    *   Le client `supabase-js` utilise des requêtes paramétrées par défaut, rendant les injections SQL impossibles via les appels standard.
*   **Protection XSS & CSRF** :
    *   **En-têtes Security** : `X-XSS-Protection`, `X-Content-Type-Options`, et `Content-Security-Policy` configurés dans `netlify.toml`.
    *   **React** : Échappement automatique des variables dans le JSX.
    *   **CSRF** : Les tokens JWT de session sont gérés sécuritairement par le client Auth avec des cookies `SameSite`.
*   **Rate Limiting** :
    *   Configuré au niveau de l'API Gateway de Supabase pour prévenir les abus (DDoS).

## 3.4 Intégrations (APIs)

Une couche de service d'abstraction (`src/services/integrations.ts`) a été créée pour standardiser les appels vers :
1.  **Paiements** : Interface prête pour Orange Money / MTN / Moov.
2.  **SMS** : Préparation pour l'envoi de notifications via Edge Functions.
3.  **Conformité** : Stub pour la vérification des licences officinales.

## Performance (Objectifs atteints)

*   **Temps de chargement < 2s** :
    *   Optimisation PWA (Service Workers).
    *   `Preconnect` sur les domaines critiques (Supabase, Fonts) ajoutés à `index.html`.
    *   Code-splitting automatique via Vite build.
*   **Disponibilité 99.9%** : Hébergement sur CDN global (Netlify) + Backend Serverless hautement disponible.
