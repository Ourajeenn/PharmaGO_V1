# Architecture Technique PharmaGo

## 3.1 Architecture Globale

### 3.1.1 Architecture Logicielle

Le projet suit une architecture moderne basée sur les **Microservices (Serverless)** et une approche **Headless**.

*   **Architecture** : Microservices (via Supabase Managed Services & Edge Functions)
*   **API** : RESTful API (Auto-generated via PostgREST) + WebSocket (Supabase Realtime)

### Composants Principaux

1.  **Frontend (SPA - Single Page Application)**
    *   **Framework** : React + Vite
    *   **Langage** : TypeScript
    *   **Communication** : Appels API REST asynchrones vers le backend.
    *   **État** : Gestion d'état global avec React Context & TanStack Query (Server State).

2.  **Backend Services (Supabase)**
    Cet écosystème remplace une architecture monolithique par des services découplés :
    *   **Authentication Service** : Gestion des utilisateurs (JWT), OAuth, et règles RLS (Row Level Security).
    *   **Database Service** : PostgreSQL relationnel.
    *   **API Service (REST)** : Exposition automatique de la base de données en API RESTful sécurisée.
    *   **Realtime Service (WebSocket)** : Canal de diffusion en temps réel pour :
        *   Le suivi des livraisons (GPS Tracking).
        *   Les notifications de nouvelles commandes.
        *   Le chat médecin/patient.
    *   **Storage Service** : Gestion des fichiers (Ordonnances, Images profils) via une API objet (S3-compatible).

### Flux de Données

*   **RESTful** : Toutes les opérations CRUD (Create, Read, Update, Delete) passent par l'API REST HTTPS standard.
*   **WebSocket** : Les composants critiques (Dashboard Pharmacie, Suivi Livreur) ouvrent des sockets persistants pour recevoir les mises à jour ("PUSH") sans recharger la page.

### Sécurité

*   **RLS (Row Level Security)** : Chaque requête API est interceptée au niveau de la base de données pour vérifier si l'utilisateur (identifié par son JWT) a le droit d'accéder à la ressource spécifique.
