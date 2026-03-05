# Architecture des Profils Utilisateurs
## Plateforme Pharma-Go - Gestion de la Chaîne Pharmaceutique

---

## 📖 Introduction

Ce document présente l'architecture complète des cinq profils utilisateurs de la plateforme Pharma-Go. Chaque profil est conçu pour répondre aux besoins spécifiques des acteurs de la chaîne pharmaceutique.

## 📑 Profils Couverts

1. **Patient** - Utilisateur final des services pharmaceutiques
2. **Livreur** - Responsable de la livraison des médicaments
3. **Assurance Maladie** - Gestionnaire des remboursements
4. **Pharmacie** - Point de vente et dispensation
5. **Médecin** - Prescripteur de médicaments

---

## 1. PATIENT 👤

### 📋 Menus et Sous-menus

| Menu | Sous-menus |
|------|------------|
| **Tableau de Bord** | Vue d'ensemble ordonnances, Statut commandes, Historique achats, Rappels médicaments |
| **Mes Ordonnances** | Télécharger, Actives, Expirées, Renouvellement |
| **Commander** | Rechercher médicament, Panier, Pharmacies proximité, Livraison, Paiement |
| **Mes Commandes** | En cours, Suivi livraison, Historique, Factures |
| **Mon Dossier Médical** | Allergies, Antécédents, Vaccinations, Traitements |
| **Remboursements** | Demandes, Statut, Historique, Documents |
| **Mon Profil** | Infos personnelles, Carte vitale, Adresses, Notifications, Sécurité |
| **Aide & Support** | FAQ, Contact support, Guide, Signaler problème |

### 🔐 Permissions
- ✅ Commander des médicaments
- ✅ Télécharger ordonnances
- ✅ Suivre les livraisons
- ✅ Gérer le profil de santé
- ✅ Demander remboursements
- ✅ Configurer rappels
- ❌ Modifier prix
- ❌ Accès back-office

---

## 2. LIVREUR 🚴

### 📋 Menus et Sous-menus

| Menu | Sous-menus |
|------|------------|
| **Tableau de Bord** | Livraisons du jour, Stats performance, Gains, Disponibilité |
| **Mes Livraisons** | Nouvelles demandes, En cours, Terminées, Annulées |
| **Itinéraire** | Optimisation tournée, Navigation GPS, Points collecte, Adresses |
| **Preuves de Livraison** | Signature électronique, Photo remise, Code confirmation, Historique |
| **Revenus** | Gains quotidiens, Relevés mensuels, Primes, Historique paiements |
| **Mon Profil** | Infos personnelles, Véhicule, Documents, Zones, Disponibilité |
| **Support** | Signaler problème, Assistance, FAQ, Contact urgence |

### 🔐 Permissions
- ✅ Accepter/Refuser livraisons
- ✅ Géolocalisation temps réel
- ✅ Mise à jour statut
- ✅ Enregistrer preuves
- ✅ Navigation optimisée
- ❌ Voir informations médicales
- ❌ Modifier commandes

---

## 3. ASSURANCE MALADIE 🏥

### 📋 Menus et Sous-menus

| Menu | Sous-menus |
|------|------------|
| **Tableau de Bord** | Demandes en attente, Stats remboursement, Budget, Alertes |
| **Demandes Remboursement** | Nouvelles, En traitement, Approuvées, Rejetées, Partielles |
| **Gestion Assurés** | Rechercher, Profils, Cartes vitales, Droits/plafonds, Historique |
| **Validation** | Vérification ordonnances, Conformité, Justificatifs, Approbation |
| **Taux Remboursement** | Barèmes, Médicaments remboursables, Taux pathologie, Exceptions |
| **Rapports** | Mensuel, Analyse dépenses, Top médicaments, Stats région, Fraudes |
| **Tiers Payant** | Pharmacies partenaires, Transactions, Factures, Conventions |
| **Administration** | Paramètres, Utilisateurs, Rôles, Audit trail |

### 🔐 Permissions
- ✅ Traiter demandes
- ✅ Approuver/Rejeter
- ✅ Vérifier éligibilité
- ✅ Configurer barèmes
- ✅ Gérer tiers payant
- ✅ Détecter anomalies
- ❌ Commander médicaments
- ❌ Livrer produits

---

## 4. PHARMACIE 💊

### 📋 Menus et Sous-menus

| Menu | Sous-menus |
|------|------------|
| **Tableau de Bord** | Commandes du jour, Ventes temps réel, Stock critique, CA, Notifications |
| **Gestion Commandes** | Nouvelles, En préparation, Prêtes, Livrées, Annulées/Retours |
| **Catalogue Produits** | Sur ordonnance, OTC, Parapharmacie, Ajouter, Modifier prix, Promotions |
| **Gestion Stocks** | Inventaire, Alertes rupture, Commandes fournisseurs, Réceptions, Péremption |
| **Ordonnances** | Valider, Vérifier authenticité, Substitutions, Archivage, Renouvellements |
| **Livraisons** | Affecter livreur, Suivi, Zones, Tarifs |
| **Tiers Payant** | Télétransmission, Factures assurances, Paiements, Rejets |
| **Clients** | Base patients, Historique achats, Fidélité, Conseils |
| **Rapports** | Ventes, Top produits, Performance, Réglementaires, Stats livraison |
| **Paramètres** | Infos légales, Horaires, Équipe, Licences, Moyens paiement |

### 🔐 Permissions
- ✅ Gérer catalogue
- ✅ Valider ordonnances
- ✅ Préparer commandes
- ✅ Gérer stocks
- ✅ Tiers payant
- ✅ Affecter livreurs
- ✅ Substitution générique
- ❌ Prescrire médicaments
- ❌ Modifier remboursements

---

## 5. MÉDECIN 👨‍⚕️

### 📋 Menus et Sous-menus

| Menu | Sous-menus |
|------|------------|
| **Tableau de Bord** | Patients du jour, Ordonnances récentes, Renouvellements, Stats prescription |
| **Mes Patients** | Liste, Rechercher, Nouveau dossier, Dossiers médicaux, Historique soins |
| **Prescriptions** | Créer ordonnance, En cours, Historique, Renouvellements, E-ordonnances |
| **Base Médicamenteuse** | Rechercher, Interactions, Contre-indications, Posologie, Génériques |
| **Consultations** | Agenda, Téléconsultations, Comptes-rendus, Certificats, Arrêts travail |
| **Suivi Thérapeutique** | Observance, Effets indésirables, Renouvellements auto, Pharmacovigilance |
| **Messagerie** | Messages patients, Communication pharmacies, Échanges confrères |
| **Mon Cabinet** | Infos professionnelles, RPPS, Spécialités, Adresse, Assurances |
| **Statistiques** | Prescriptions/période, Top médicaments, Taux renouvellement, Rapports |

### 🔐 Permissions
- ✅ Créer ordonnances
- ✅ Accès dossiers médicaux
- ✅ Renouveler traitements
- ✅ Vérifier interactions
- ✅ Téléconsultation
- ✅ Messagerie patient
- ✅ Signaler pharmacovigilance
- ❌ Dispenser médicaments
- ❌ Gérer remboursements

---

## 📊 Matrice de Permissions Croisées

| Fonctionnalité | Patient | Livreur | Assurance | Pharmacie | Médecin |
|----------------|---------|---------|-----------|-----------|---------|
| Commander médicaments | ✅ | ❌ | ❌ | ✅ | ❌ |
| Créer ordonnances | ❌ | ❌ | ❌ | ❌ | ✅ |
| Valider ordonnances | ❌ | ❌ | ❌ | ✅ | ❌ |
| Effectuer livraisons | ❌ | ✅ | ❌ | ❌ | ❌ |
| Traiter remboursements | ❌ | ❌ | ✅ | ❌ | ❌ |
| Gérer stocks | ❌ | ❌ | ❌ | ✅ | ❌ |
| Consulter dossier médical | ✅ | ❌ | ✅ | ✅ | ✅ |
| Modifier prix produits | ❌ | ❌ | ❌ | ✅ | ❌ |
| Géolocalisation temps réel | ✅ | ✅ | ❌ | ✅ | ❌ |
| Tiers payant | ❌ | ❌ | ✅ | ✅ | ❌ |
| Suivi thérapeutique | ✅ | ❌ | ❌ | ✅ | ✅ |
| Messagerie sécurisée | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 Principes de Conception

1. **Séparation des responsabilités** - Chaque profil dispose uniquement des accès nécessaires
2. **Sécurité et confidentialité** - Données médicales protégées
3. **Traçabilité** - Actions critiques enregistrées
4. **Conformité réglementaire** - RGPD, e-santé, pharmacovigilance
5. **Expérience utilisateur optimisée** - Interfaces adaptées

---

*Document généré pour Pharma-Go - Février 2026*
