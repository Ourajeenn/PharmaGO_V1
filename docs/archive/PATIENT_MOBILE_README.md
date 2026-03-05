# Interface Patient Mobile - Pharmacie en Ligne

## Vue d'ensemble

L'interface patient mobile (`PatientMobileInterface.tsx`) a été créée pour correspondre exactement au design de pharmacie en ligne fourni dans l'image de référence. C'est une application mobile complète avec 3 écrans principaux.

## Accès

L'interface est accessible via l'URL : **`/patient-mobile`**

Par exemple : `http://localhost:8080/patient-mobile`

## Les 3 Écrans

### 1. **Écran d'Accueil (Home)**

#### Header
- **Avatar** : Photo de profil du patient
- **Heure** : 9:41 (affichage mobile)
- **Notification** : Cloche jaune avec badge du nombre d'articles dans le panier

#### Titre
- "Your Trusted"
- "Online Pharmacy"

#### Barre de recherche
- Placeholder : "Search here..."
- Bouton de recherche bleu

#### Catégories (5 catégories)
1. **Health** ❤️ (Rouge)
2. **Bandage** 🩹 (Orange)
3. **Medicine** 💊 (Bleu - Active)
4. **Vitamin** 🍊 (Jaune)
5. **Multivit** 🧪 (Vert)

#### Best Products (Grille 2 colonnes)
1. **Biotin coconut oil**
   - Prix : $20.00
   - Badge : 20% OFF
   - Catégorie : Medicine
   - Bouton + pour ajouter au panier

2. **Whey-RX**
   - Prix : $12.00
   - Badge : 20% OFF
   - Catégorie : Medicine
   - Bouton + pour ajouter au panier

3. **Biotin For Beauty**
   - Prix : $24.50
   - Catégorie : Medicine
   - Bouton + pour ajouter au panier

#### Navigation Bottom (4 icônes)
- **Home** 🏠 (Active - Bleu)
- **Favorites** ❤️
- **Settings** ⚙️
- **Cart** 🛒 (avec badge du nombre d'articles)

### 2. **Écran Détail Produit**

#### Header
- **Bouton retour** ← (retour à l'accueil)
- **Heure** : 9:41
- **Favoris** : Cœur (ajouter aux favoris)

#### Image Produit
- Grande image du produit (gradient vert-bleu)
- Badge avec note : ⭐ 4.9

#### Informations Produit
- **Nom** : Biotin For Beauty
- **Capsules** : 60 Capsules
- **Prix** : $24.50
- **Quantité** : Boutons - / + avec compteur (2)

#### Description
- Texte complet : "Ambrosiol Essentials Biotin is a plant-based supplement that nourishes hair, skin, and nails, boosting natural beauty, strength, vitality, and wellness"

#### Bouton d'action
- **"+ Add product"** (Bleu, pleine largeur)

### 3. **Écran Checkout (Panier)**

#### Header
- **Bouton retour** ← (retour à l'accueil)
- **Titre** : "Checkout"
- **Menu** : ⋮ (options)

#### Liste des Produits (3 produits par défaut)
1. **Liver cleans detox**
   - Prix : $60.99
   - Size : 120 Count
   - Quantité : 2 (boutons - / +)
   - Bouton supprimer 🗑️

2. **Vitamin Capsules**
   - Prix : $55.99
   - Size : 90 Count
   - Quantité : 2 (boutons - / +)
   - Bouton supprimer 🗑️

3. **Covid vaccine**
   - Prix : $60.99
   - Size : 100 Count
   - Quantité : 2 (boutons - / +)
   - Bouton supprimer 🗑️

#### Bouton Ajouter
- **"+ Add product"** (Bordure pointillée bleue)

#### Résumé de Paiement
- **Payment** : $60.99 (sous-total)
- **Delivery** : $60.99 (livraison)
- **Total** : $60.99 (total)

#### Voucher
- **"Use voucher"** (bouton avec +)

#### Bouton Final
- **"Pay Now"** (Bleu, pleine largeur)

## Fonctionnalités Interactives

### Navigation entre les écrans
1. **Home → Product Detail** : Cliquer sur un produit
2. **Product Detail → Home** : Bouton retour
3. **Home → Checkout** : Icône panier dans la navigation
4. **Checkout → Home** : Bouton retour

### Gestion du Panier
- **Ajouter au panier** : Bouton + sur chaque produit
- **Augmenter quantité** : Bouton + dans le panier
- **Diminuer quantité** : Bouton - dans le panier
- **Supprimer** : Icône poubelle
- **Badge** : Nombre d'articles affiché sur l'icône panier

### Recherche
- Barre de recherche fonctionnelle
- Filtre en temps réel (à implémenter avec Supabase)

### Catégories
- Sélection de catégorie
- Filtre des produits par catégorie

### Favoris
- Ajouter/retirer des favoris
- Icône cœur sur chaque produit

### Toast Notifications
- Confirmation d'ajout au panier
- Confirmation de suppression
- Confirmation de commande

## Design

### Palette de couleurs
- **Background** : Gradient purple-50 via blue-50 to pink-50
- **Container** : White/80 avec backdrop blur
- **Bouton principal** : Blue-600
- **Badges** : Green-100 (discount), Red-500 (notifications)
- **Catégories** : Rouge, Orange, Bleu, Jaune, Vert

### Typographie
- **Titres** : Font-bold, text-slate-900
- **Prix** : Text-lg/xl/2xl, font-bold
- **Descriptions** : Text-sm, text-slate-600
- **Labels** : Text-xs, text-slate-500

### Effets
- Backdrop blur sur le container
- Shadows sur les cartes
- Hover effects
- Transitions douces
- Bordures arrondies (rounded-xl, rounded-2xl)

## Composants UI

### Cartes de Produits
- Image avec gradient
- Badge de réduction (si applicable)
- Icône favoris
- Nom et catégorie
- Prix
- Bouton d'ajout au panier

### Navigation Bottom
- 4 icônes fixes
- Icône active en bleu avec fond
- Badge de notification sur le panier

### Panier Items
- Image du produit
- Nom et taille
- Prix
- Contrôles de quantité
- Bouton de suppression

## Données

### Produits par défaut
```typescript
{
  id: '1',
  name: 'Biotin coconut oil',
  category: 'Medicine',
  price: 20.00,
  rating: 4.9,
  capsules: 60,
  discount: 20
}
```

### Panier par défaut (3 produits)
```typescript
{
  id: '1',
  name: 'Liver cleans detox',
  price: 60.99,
  capsules: 120,
  quantity: 2
}
```

## Intégration future avec Supabase

### Tables à créer

#### `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  capsules INTEGER,
  image_url TEXT,
  rating DECIMAL(2, 1),
  discount INTEGER,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `cart_items`
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `favorites`
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

### Fonctions à implémenter
- `fetchProducts()` : Récupérer tous les produits
- `fetchProductsByCategory()` : Filtrer par catégorie
- `searchProducts()` : Rechercher des produits
- `addToCart()` : Ajouter au panier
- `updateCartQuantity()` : Mettre à jour la quantité
- `removeFromCart()` : Supprimer du panier
- `toggleFavorite()` : Basculer le favori
- `checkout()` : Passer la commande

## Utilisation

### Accéder à l'interface
```typescript
// Dans le navigateur
http://localhost:8080/patient-mobile

// Ou via navigation
navigate('/patient-mobile')
```

### Ajouter un produit au panier
```typescript
addToCart(product)
// Affiche un toast : "[nom du produit] ajouté au panier"
```

### Passer une commande
```typescript
handleCheckout()
// Affiche un toast : "Commande passée avec succès!"
// Vide le panier
// Retourne à l'écran d'accueil
```

## Responsive Design

L'interface est optimisée pour mobile :
- **Max-width** : 448px (md)
- **Container** : Centré avec ombres
- **Layout** : Adapté aux petits écrans
- **Touch-friendly** : Boutons et zones cliquables assez grands

## Prochaines améliorations

1. **Intégration Supabase** : Connexion à la base de données
2. **Authentification** : Login/Signup
3. **Paiement** : Intégration Mobile Money/Carte bancaire
4. **Historique** : Commandes passées
5. **Notifications** : Push notifications
6. **Tracking** : Suivi de livraison en temps réel
7. **Favoris** : Gestion complète des favoris
8. **Profil** : Édition du profil utilisateur
9. **Recherche avancée** : Filtres multiples
10. **Recommandations** : Produits suggérés

## Notes techniques

- **Framework** : React + TypeScript
- **UI Library** : shadcn/ui
- **Icons** : Lucide React
- **State Management** : React Hooks (useState)
- **Routing** : React Router
- **Styling** : Tailwind CSS
- **Notifications** : Sonner (toast)

## Fichiers créés

1. `src/components/dashboard/PatientMobileInterface.tsx` (composant principal)
2. `src/pages/PatientMobilePage.tsx` (page wrapper)
3. `src/App.tsx` (route ajoutée)

## Accès rapide

- **URL** : `/patient-mobile`
- **Composant** : `<PatientMobileInterface />`
- **Page** : `<PatientMobilePage />`

---

**Interface patient mobile prête à l'emploi! 📱**

Pour tester : Ouvrez `http://localhost:8080/patient-mobile` dans votre navigateur.

**Astuce** : Pour une meilleure expérience, utilisez le mode responsive de votre navigateur (F12 → Toggle device toolbar) et sélectionnez un appareil mobile.
