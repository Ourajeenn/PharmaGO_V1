# SEO Configuration - PharmaGo

## Pages SEO Optimisées

### 🏠 Homepage (/)
**Title**: PharmaGo - Pharmacie en Ligne Abidjan | Livraison 24h
**Description**: Commandez vos médicaments en ligne avec PharmaGo. Livraison rapide 24h/24 à Abidjan, consultation IA gratuite, plus de 100 pharmacies partenaires.
**Keywords**: pharmacie en ligne Abidjan, livraison médicaments Côte d'Ivoire, pharmacie de garde, ordonnance en ligne

### 💊 Médicaments (/medicaments)
**Title**: Médicaments en Ligne - Plus de 100 Produits | PharmaGo Abidjan
**Description**: Achetez vos médicaments sur ordonnance et en vente libre. Catalogue complet, prix compétitifs, livraison rapide à Abidjan et dans toute la Côte d'Ivoire.
**Keywords**: achat médicaments en ligne, paracétamol, antibiotiques, médicaments sur ordonnance CI

### 🏥 Pharmacies (/pharmacies)
**Title**: Pharmacies de Garde Abidjan - Carte & Horaires | PharmaGo
**Description**: Trouvez une pharmacie de garde ouverte près de chez vous à Abidjan. Carte interactive, horaires, coordonnées, itinéraire GPS. Plus de 100 pharmacies partenaires.
**Keywords**: pharmacie de garde Abidjan, pharmacie ouverte maintenant, pharmacie 24h/24 Abidjan, carte pharmacies Côte d'Ivoire

### 🤖 Consultation IA (/consultation)
**Title**: Consultation Médicale IA Gratuite - Leslie | PharmaGo
**Description**: Consultez Leslie, notre assistant santé IA gratuit. Conseils médicaux personnalisés, orientation vers les spécialistes, télémédecine 24h/24.
**Keywords**: téléconsultation gratuite, consultation IA santé, médecin virtuel Abidjan, conseil médical en ligne

### 📱 E-Carnet (/e-carnet)
**Title**: Carnet de Santé Électronique Gratuit | PharmaGo CI
**Description**: Votre dossier médical numérique sécurisé. Vaccinations, ordonnances, consultations, résultats d'analyses. Accessible 24h/24 depuis votre mobile.
**Keywords**: carnet de santé numérique, dossier médical électronique, e-santé Côte d'Ivoire, vaccination tracking

### 🚚 Suivi Commande (/tracking)
**Title**: Suivi de Commande en Temps Réel | PharmaGo Livraison
**Description**: Suivez votre commande de médicaments en temps réel. GPS du livreur, notifications instantanées, livraison garantie en moins de 2h à Abidjan.
**Keywords**: suivi commande médicaments, tracking livraison temps réel, livraison express Abidjan

### 💳 Paiement (/payment)
**Title**: Paiement Sécurisé - CB, Mobile Money, Cash | PharmaGo
**Description**: Payez en toute sécurité par carte bancaire, Orange Money, MTN Mobile Money ou en espèces à la livraison. Transaction SSL cryptée.
**Keywords**: paiement mobile money, paiement sécurisé médicaments, Orange Money, MTN Money

### 🌸 Parapharmacie (/parapharmacie)
**Title**: Parapharmacie en Ligne - Beauté, Bien-être | PharmaGo
**Description**: Produits de beauté, compléments alimentaires, hygiène, cosmétiques. Marques internationales, livraison rapide à Abidjan.
**Keywords**: parapharmacie en ligne Abidjan, produits beauté, compléments alimentaires, cosmétiques Côte d'Ivoire

### 📞 Contact (/contact)
**Title**: Contactez-nous - Service Client 24h/24 | PharmaGo
**Description**: Besoin d'aide ? Notre service client est disponible 24h/24. Téléphone, email, chat en direct. Réponse garantie en moins de 2h.
**Keywords**: contact pharmacie en ligne, service client PharmaGo, aide médicaments

---

## Mots-clés Principaux par Catégorie

### Géolocalisation
- Abidjan
- Côte d'Ivoire
- CI
- Plateau, Cocody, Marcory, Yopougon, Abobo, Adjamé, Treichville

### Services
- livraison médicaments
- pharmacie en ligne
- téléconsultation
- e-santé
- carnet de santé numérique
- pharmacie de garde

### Produits
- médicaments sur ordonnance
- parapharmacie
- compléments alimentaires
- tests rapides
- matériel médical

### Urgences
- pharmacie 24h/24
- livraison urgente
- consultation immédiate
- garde de nuit

---

## Schema.org Markup

### LocalBusiness (Pharmacies)
```json
{
  "@context": "https://schema.org",
  "@type": "Pharmacy",
  "name": "PharmaGo",
  "image": "https://pharmago.ci/logo.png",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Abidjan",
    "addressCountry": "CI"
  },
  "telephone": "+225-XX-XX-XX-XX",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "priceRange": "FCFA"
}
```

### MedicalBusiness
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "PharmaGo - Pharmacie en Ligne",
  "description": "Plateforme de commande et livraison de médicaments en ligne",
  "areaServed": "Côte d'Ivoire"
}
```

---

## Open Graph Images

**Dimensions recommandées**: 1200x630px
**Format**: JPG ou PNG
**Taille max**: 8MB

**Images à créer**:
- `/og-image.jpg` - Homepage (logo + slogan)
- `/og-medicaments.jpg` - Catalogue médicaments
- `/og-pharmacies.jpg` - Carte pharmacies
- `/og-consultation.jpg` - Leslie IA
- `/og-ecarnet.jpg` - E-carnet santé

---

## Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pharmago.ci/</loc>
    <lastmod>2024-12-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pharmago.ci/medicaments</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pharmago.ci/pharmacies</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- ... autres pages ... -->
</urlset>
```

---

## Robots.txt

```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /profile
Disallow: /admin

Sitemap: https://pharmago.ci/sitemap.xml
```

---

## Performance SEO Target

| Métrique | Cible | Actuel | Statut |
|----------|-------|--------|--------|
| Title optimisé | ✅ | ❌ | EN COURS |
| Meta description | ✅ | ❌ | EN COURS |
| Keywords | ✅ | ❌ | EN COURS |
| Open Graph | ✅ | ❌ | EN COURS |
| Schema.org | ✅ | ❌ | À FAIRE |
| Sitemap | ✅ | ❌ | À FAIRE |
| Robots.txt | ✅ | ❌ | À FAIRE |
| Mobile-friendly | ✅ | ✅ | OK |
| HTTPS | ✅ | À VÉRIFIER | - |
| Page Speed | >90 | À MESURER | - |
