# Parcours Utilisateurs - Pharma-Go Abidjan
## Février 2026

## 📖 Introduction
Parcours utilisateurs détaillés de la plateforme Pharma-Go pour Abidjan. Chaque scénario illustre un cas d'usage réel.

### Spécificités Locales Intégrées
- Ordonnances papier et électroniques (transition digitale)
- Téléconsultations et e-prescriptions
- Livraison express 45 minutes (Grand Abidjan)
- Paiement Mobile Money (Orange Money, MTN Money, Wave)
- CMU ivoirienne et assurances privées (MUGEF-CI, NSIALIFE)
- Suivi GPS temps réel
- IA détection interactions médicamenteuses

---

## 👤 Parcours PATIENT

### 🛒 Scénario 1: Commander avec Ordonnance
**Contexte**: Aya, 32 ans, ordonnance pour infection urinaire.

| Étape | Action | Détails |
|-------|--------|---------|
| 1 | Réception Ordonnance | Photo ordonnance, analyse IA, connexion biométrique |
| 2 | Sélection Pharmacie | Comparaison prix/distance, stock confirmé |
| 3 | Configuration Livraison | Express 45min (2000 FCFA) ou Standard 2h (1000 FCFA) |
| 4 | Paiement | Récapitulatif, couverture CMU, Orange Money |
| 5 | Suivi Temps Réel | GPS livreur, notifications, signature électronique |

### 💊 Scénario 2: Acheter Sans Ordonnance (Click & Collect)
**Contexte**: Koné, 25 ans, maux de tête, paracétamol.

| Étape | Action | Détails |
|-------|--------|---------|
| 1 | Recherche Produit | Filtres, comparateur prix, 6 produits |
| 2 | Conseil IA | Dosage, contre-indications, recommandations |
| 3 | Click & Collect | Pharmacies ouvertes, disponibilité temps réel |
| 4 | Paiement | MTN Money, QR Code généré |
| 5 | Retrait | QR Code, conseil pharmacien, reçu digital |

---

## 🏍️ Parcours LIVREUR

### Scénario: Livraison Express Multi-Commandes
**Contexte**: Kouassi, livreur moto-taxi, optimisation itinéraire.

| Étape | Action | Détails |
|-------|--------|---------|
| 1 | Activation | Géolocalisation, commandes groupées, prime |
| 2 | Collecte | Navigation GPS, scan QR, vérification étanchéité |
| 3 | Itinéraire Optimisé | Alertes embouteillage, alternatives |
| 4 | Livraison 1 | Accès résidence, signature électronique, photo |
| 5 | Livraison 2 | Gestion absence (voisin/retour) |
| 6 | Fin Mission | Gains calculés, nouvelles propositions |

---

## 💊 Parcours PHARMACIE

### Scénario: Commande Urgente Pédiatrique
**Contexte**: Commande pour enfant 4 ans, fièvre 39°C.

| Étape | Action | Détails |
|-------|--------|---------|
| 1 | Réception | Notification urgente, ordonnance pédiatre |
| 2 | Validation | Vérification signature, posologie, allergies |
| 3 | Préparation | Stock, péremption, seringue doseuse, conseils |
| 4 | Facturation | Prix, assurance MUGEF-CI 60%, reste à charge |
| 5 | Affectation | Étiquetage QR, instructions livreur |

---

## 👨‍⚕️ Parcours MÉDECIN

### Scénario: Téléconsultation et E-Prescription
**Contexte**: Dr. Kouamé, téléconsultation douleurs abdominales.

| Étape | Action | Détails |
|-------|--------|---------|
| 1 | Préparation | Dossier patient, allergies, antécédents |
| 2 | Téléconsultation | WhatsApp, interrogatoire, limites examen |
| 3 | E-Prescription | Recherche traitement, alerte IA interactions |
| 4 | Signature | Certificat numérique, envoi multi-canal |
| 5 | Facturation | Honoraires Orange Money, rappel J+7 |

---

## 🏥 Parcours ASSURANCE (CMU)

### Scénario: Traitement Automatisé Demande CMU
**Contexte**: Feuille de soins télétransmise.

| Étape | Action | Détails |
|-------|--------|---------|
| 1 | Réception | Télétransmission pharmacie |
| 2 | Vérifications IA | Carte active, droits, ordonnance, doublons |
| 3 | Vérification Manuelle | Photo floue → agent examine |
| 4 | Calcul | Taux CMU (50-70%), ticket modérateur |
| 5 | Paiement | Virement 7 jours, SMS patient |

---

## 🔄 Parcours Cross-Profils: Cycle Complet

**Timeline**: 1h55 du diagnostic à la livraison

```
MÉDECIN (10h30) → PATIENT (10h35) → PHARMACIE (10h43) → LIVREUR (12h25) → ASSURANCE (12h30)
```

### Métriques
- **Temps total**: 1h55 (avec retard circulation)
- **Satisfaction**: 4/5 étoiles
- **Automatisation**: 85%
- **Remboursement CMU**: 5,350 FCFA (7 jours)

---

## ⚠️ Défis Spécifiques Abidjan

### Infrastructure
- Circulation dense, délais imprévisibles
- Réseau variable, qualité photos médiocre
- Adressage approximatif

### Pratiques Médicales
- Ordonnances manuscrites majoritaires
- Transition digitale progressive

### Assurance Santé
- CMU: 70% population non couverte
- Délais remboursement 7+ jours
- Vérification manuelle 40% dossiers

---

## 🔮 Recommandations 2026

1. **Mode hors-ligne** pour commandes sans connexion
2. **Amélioration OCR** ordonnances manuscrites
3. **Livraison gratuite** > 10,000 FCFA
4. **Version USSD** (code *xxx#) sans smartphone
5. **Points relais** quartiers
6. **Tutoriels nouchi** (français local)
