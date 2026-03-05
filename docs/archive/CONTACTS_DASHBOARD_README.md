# Dashboard Contacts - DOZ Pharmacy

## Vue d'ensemble

Le dashboard de contacts (`ContactsDashboard.tsx`) a été créé pour correspondre exactement au design DOZ Pharmacy fourni dans l'image de référence.

## Accès

Le dashboard est accessible via l'URL : **`/contacts-dashboard`**

Par exemple : `http://localhost:8080/contacts-dashboard`

## Fonctionnalités

### 1. **Sidebar Alphabétique (Gauche)**
- **Design** : Gradient bleu foncé (blue-600 to indigo-700)
- **Navigation alphabétique** : Lettres A-Z pour tri rapide
- **Texte vertical** : "Alphabetical sorting" en rotation
- **Icônes d'action** :
  - Settings
  - Users
  - Mail
  - Calendar
  - More (en bas)
- **Lettre active** : Fond blanc avec texte bleu

### 2. **Header**
- **Logo** : Icône pilule avec gradient rose-violet
- **Barre de recherche** : Recherche globale des contacts
- **Titre** : "DOZ Pharmacy - Contacts"
- **Boutons d'action** :
  - **ADD CONTACT** (rose) : Ajouter un nouveau contact
  - **Filter** : Filtrer les contacts
  - **Search** (bleu) : Recherche avancée

### 3. **Section Favorite**
- **Titre** : "Favorite"
- **Layout** : Grille de 4 cartes
- **Chaque carte affiche** :
  - Avatar du contact
  - Nom et rôle
  - Étoile favorite (jaune, remplie)
  - Badge de statut (Active/Inactive)
  - Localisation avec icône
  - Boutons : "Send message" et "Call"

#### Contacts favoris par défaut :
1. **Julia Gomes** - Zencorporation (Active, San Francisco, USA)
2. **Carolina Cunha** - Grooveshark (Inactive, Paris, France)
3. **Anna Maria** - Telecentrics (Active, Warsaw, Poland)
4. **Clara Alves** - Toughzap (Active, Zurich, Switzerland)

### 4. **Contacts List (Table)**
- **Titre** : "Contacts list"
- **Colonnes** :
  - **Name** : Avatar + Nom + Rôle
  - **Status** : Badge Active/Inactive
  - **Location** : Ville, Pays
  - **Tags** : Badges colorés (CLIENT, WORKSHOP, BOARD ROOM, INTERNAL WORKS)
  - **Actions** : Send message (bleu) + Call (gris)

#### Contacts dans la liste :
1. **Robert Marter** - Grooveshark (Active, San Francisco, USA) - Tags: CLIENT, WORKSHOP
2. **Seth Meyes - Tuttiano** - Konmatfix (Active, Los Angeles, USA) - Tags: INTERNAL WORKS, BOARD ROOM
3. **Derek Mimhouse** - Grooveshark (Inactive, Miami, USA) - Tags: CLIENT
4. **Gabriele Morvalho** - Konmatfix (Active, Paris, France) - Tags: BOARD ROOM, WORKSHOP, INTERNAL WORKS
5. **Murilo Nakroncalves** - Toughzap (Active, Toronto, CA) - Tags: WORKSHOP

### 5. **Fonctionnalités Interactives**

#### **Recherche**
- Barre de recherche dans le header
- Filtre en temps réel des contacts

#### **Tri alphabétique**
- Cliquer sur une lettre dans la sidebar
- Filtre les contacts par première lettre du nom

#### **Favoris**
- Cliquer sur l'étoile pour ajouter/retirer des favoris
- Les favoris apparaissent dans la section "Favorite"

#### **Actions sur les contacts**
- **Send message** : Envoie un message (toast de confirmation)
- **Call** : Appel téléphonique (toast de confirmation)

#### **Statuts**
- **Active** : Badge vert
- **Inactive** : Badge gris

#### **Tags colorés**
- **CLIENT** : Violet
- **WORKSHOP** : Vert
- **BOARD ROOM** : Rose
- **INTERNAL WORKS** : Orange

## Design

### Palette de couleurs :
- **Sidebar** : Gradient blue-600 to indigo-700
- **Background** : Gradient purple-50 to pink-50
- **Active letter** : White background, blue text
- **ADD CONTACT button** : Pink-400
- **Search button** : Blue-600
- **Status Active** : Green-50/700
- **Status Inactive** : Gray-50/700

### Typographie :
- **Titres** : Font-bold, text-slate-900
- **Noms** : Font-semibold, text-sm
- **Rôles** : Text-xs, text-slate-500
- **Tags** : Text-[10px], font-semibold, uppercase

### Effets :
- Hover effects sur les cartes
- Transitions douces
- Shadows sur les cartes
- Backdrop blur sur le header
- Bordures arrondies (rounded-lg, rounded-xl)

## Composants UI

### Cartes de favoris :
- Avatar avec gradient
- Nom et rôle
- Badge de statut
- Localisation
- 2 boutons d'action
- Étoile favorite

### Table de contacts :
- Header avec colonnes
- Lignes avec hover effect
- Avatars
- Badges de statut et tags
- Boutons d'action alignés à droite

### Sidebar alphabétique :
- Lettres A-Z verticales
- Lettre active en blanc
- Texte vertical "Alphabetical sorting"
- Icônes d'action

## Utilisation

### Accéder au dashboard :
```typescript
// Dans le navigateur
http://localhost:8080/contacts-dashboard

// Ou via navigation
navigate('/contacts-dashboard')
```

### Ajouter un contact aux favoris :
```typescript
// Cliquer sur l'étoile d'un contact
toggleFavorite(contactId)
```

### Envoyer un message :
```typescript
handleSendMessage(contactName)
// Affiche un toast : "Message envoyé à [nom]"
```

### Appeler un contact :
```typescript
handleCall(contactName)
// Affiche un toast : "Appel vers [nom]"
```

## Intégration future avec Supabase

Pour connecter ce dashboard à Supabase, vous pouvez créer une table `contacts` :

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  status TEXT CHECK (status IN ('Active', 'Inactive')),
  location TEXT,
  tags TEXT[],
  avatar_url TEXT,
  is_favorite BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Fonctions à implémenter :
- `fetchContacts()` : Récupérer tous les contacts
- `addContact()` : Ajouter un nouveau contact
- `updateContact()` : Mettre à jour un contact
- `deleteContact()` : Supprimer un contact
- `toggleFavorite()` : Basculer le statut favori
- `searchContacts()` : Rechercher des contacts
- `filterByLetter()` : Filtrer par lettre

## Prochaines améliorations

1. **CRUD complet** : Ajouter, modifier, supprimer des contacts
2. **Intégration Supabase** : Connexion à la base de données
3. **Filtres avancés** : Par statut, tags, localisation
4. **Export** : PDF/CSV des contacts
5. **Import** : Import de contacts depuis fichier
6. **Groupes** : Organiser les contacts en groupes
7. **Historique** : Historique des interactions
8. **Notes** : Ajouter des notes aux contacts
9. **Rappels** : Système de rappels
10. **Intégration email** : Envoyer des emails directement

## Notes techniques

- **Framework** : React + TypeScript
- **UI Library** : shadcn/ui
- **Icons** : Lucide React
- **State Management** : React Hooks (useState)
- **Styling** : Tailwind CSS
- **Routing** : React Router

## Fichiers créés

1. `src/components/dashboard/ContactsDashboard.tsx` (composant principal)
2. `src/pages/ContactsDashboardPage.tsx` (page wrapper)
3. `src/App.tsx` (route ajoutée)

## Accès rapide

- **URL** : `/contacts-dashboard`
- **Composant** : `<ContactsDashboard />`
- **Page** : `<ContactsDashboardPage />`

---

**Dashboard de contacts prêt à l'emploi! 📇**

Pour tester : Ouvrez `http://localhost:8080/contacts-dashboard` dans votre navigateur.
