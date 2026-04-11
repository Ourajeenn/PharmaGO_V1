# 🏥 PharmaGo Express - Plateforme Intégrée de Santé

PharmaGo Express est une solution complète de gestion de la chaîne pharmaceutique et de livraison de médicaments, conçue pour connecter patients, médecins, pharmacies, livreurs et assurances au sein d'un écosystème unique, sécurisé et performant.

---

## 🏗️ Architecture Technique Complète

L'application repose sur une architecture moderne **Headless** et **Serverless (Microservices)**, privilégiant la scalabilité et la réactivité en temps réel.

### 1. Stack Technologique

#### **Frontend (SPA)**
- **Framework** : [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) (Build ultra-rapide)
- **Langage** : [TypeScript](https://www.typescriptlang.org/) (Typage strict)
- **UI & UX** : [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **Gestion d'État** : TanStack Query (Server State), React Context (Global State)
- **Optimisation** : Chargement différé (Dynamic Imports) pour les bibliothèques lourdes (Tesseract.js, jsPDF).

#### **Backend (Supabase Ecosystem)**
- **Base de Données** : PostgreSQL (Relationnel, Extensible)
- **Authentification** : Supabase Auth (JWT, Gestion des sessions)
- **Stockage Objets** : Supabase Storage (S3-compatible pour ordonnances et visuels)
- **Temps Réel** : Supabase Realtime (WebSockets pour GPS, Chat, Notifications)
- **Logique Serveur** : Edge Functions (Deno deploy) pour les traitements lourds et intégrations tierces.

---

## 👥 Profils Utilisateurs & Permissions

PharmaGo gère 5 types de profils distincts avec une segmentation stricte des accès via **RLS (Row Level Security)**.

### Matrice des Rôles

| Fonctionnalité | Patient | Livreur | Assurance | Pharmacie | Médecin |
|----------------|---------|---------|-----------|-----------|---------|
| Commander produits | ✅ | ❌ | ❌ | ✅ | ❌ |
| Créer ordonnances | ❌ | ❌ | ❌ | ❌ | ✅ |
| Valider ordonnances | ❌ | ❌ | ❌ | ✅ | ❌ |
| Effectuer livraisons | ❌ | ✅ | ❌ | ❌ | ❌ |
| Tiers payant | ❌ | ❌ | ✅ | ✅ | ❌ |
| Consulter Dossier Médical | ✅ | ❌ | ✅ | ✅ | ✅ |
| Géolocalisation Temps Réel | ✅ | ✅ | ❌ | ✅ | ❌ |
| Messagerie Sécurisée | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🛠️ Modules Clés & Spécificités

### 1. Hub de Messagerie Unifié (Unified Messaging Hub)
- **Messagerie sécurisée** entre tous les rôles.
- **Real-time** : Réception instantanée via WebSockets.
- **Design Premium** : Interface avec glassmorphism et micro-animations.

### 2. Assistant Santé IA (Leslie)
- **Support Vocal** : Commandes via `VoiceCommandControl`.
- **Analyse Médicale** : Analyse proactive des métriques de santé du patient.
- **Chatbot Intelligent** : Réponses basées sur une base de connaissances médicale.

### 3. Système de Panier & Commandes
- **Calcul Dynamique** : Gestion des taxes, remises et frais de livraison.
- **Tiers Payant** : Intégration automatique des taux de remboursement selon l'assurance.
- **Visualisation** : Interface premium avec images de fond dynamiques.

### 4. Suivi de Livraison & GPS
- **Maps Interactives** : Intégration [Leaflet](https://leafletjs.com/) pour la géolocalisation.
- **Tracking Livreur** : Mise à jour en temps réel des coordonnées GPS.

---

## 🔒 Sécurité & Performance

### Row Level Security (RLS)
Chaque requête API est filtrée nativement par PostgreSQL. Un utilisateur (JWT) ne peut voir que ce qui lui appartient (`auth.uid() = user_id`).

### Optimisation Bundle (Lazy Loading)
Pour maintenir un chargement initial rapide (< 2s), les modules lourds sont importés dynamiquement :
- **OCR (Tesseract.js)** : Uniquement lors du scan d'ordonnance.
- **PDF Engine (jsPDF)** : Uniquement lors de l'export de factures ou rapports.

---

## 🔄 Synchronisation de Données (AIRP & Pratik-CI)

L'application intègre des flux de données automatisés pour garantir des informations à jour.

- **Extraction AIRP** : Scrapers Python pour récupérer les bases médicamenteuses officiellement agréées.
- **Pratik-CI Sync** : Synchronisation automatique (toutes les 6h) des **Pharmacies de Garde** via Selenium (contournement anti-bot).

---

## 🚀 Guide de Développement & Déploiement

### Installation Locale
```bash
# Installation
npm install

# Lancement
npm run dev

# Build Production
npm run build
```

### Déploiement
- **Frontend** : Déployable sur Vercel, Netlify ou Cloudflare Pages via le build static.
- **Backend (Docker)** : Option de déploiement via Docker Compose pour une infrastructure auto-hébergée (recommandé pour la souveraineté des données de santé).

---

## 📚 Structure de Documentation (Archive)
Pour des guides détaillés, reportez-vous aux sections spécifiques conservées dans `docs/` :
- `DOCKER_DEPLOYMENT_GUIDE.md` : Guide d'infrastructure.
- `SECURITY_README.md` : Détails techniques des politiques RLS SQL.
- `PHARMACIES_GARDE_INTEGRATION.md` : Guide de synchronisation des pharmacies.

---
*Généré pour PharmaGo Express - Février 2026*
