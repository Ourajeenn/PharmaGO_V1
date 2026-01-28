# Sécurité et Authentification - PharmaGo

## Vue d'ensemble

Ce document décrit l'implémentation de la sécurité dans PharmaGo, incluant l'authentification des utilisateurs, l'affichage du profil connecté, et la protection des données avec Row Level Security (RLS).

## 1. Affichage de l'Utilisateur Connecté

### Header avec Profil Utilisateur

Le header (`src/components/Header.tsx`) affiche maintenant :

#### **Utilisateur Connecté**
- ✅ **Avatar** : Photo de profil ou initiales
- ✅ **Nom** : Nom complet de l'utilisateur
- ✅ **Badge de rôle** : Couleur selon le type d'utilisateur
  - Patient : Bleu
  - Pharmacie : Vert
  - Médecin : Violet
  - Livreur : Orange
  - Assureur : Cyan
  - Admin : Rouge

#### **Menu Dropdown**
- ✅ **Dashboard** : Accès au tableau de bord
- ✅ **Changer de profil** : Retour à la sélection de profil
- ✅ **Déconnexion** : Se déconnecter de l'application

#### **Utilisateur Non Connecté**
- ✅ Bouton "Profils" pour se connecter
- ✅ Redirection vers la page de sélection de profil

### Responsive Design

Le header est entièrement responsive :

#### **Desktop (> 768px)**
- Avatar + Nom + Badge de rôle
- Menu dropdown complet
- Navigation complète visible

#### **Tablet (768px - 1024px)**
- Avatar + Nom (badge caché)
- Menu dropdown simplifié
- Navigation réduite

#### **Mobile (< 768px)**
- Avatar uniquement
- Menu hamburger
- Navigation dans le menu mobile

## 2. Row Level Security (RLS)

### Qu'est-ce que RLS ?

Row Level Security (RLS) est une fonctionnalité de Supabase/PostgreSQL qui permet de contrôler l'accès aux données **au niveau des lignes** dans les tables. Chaque utilisateur ne peut accéder qu'aux données qui lui appartiennent.

### Tables Protégées

Toutes les tables principales ont RLS activé :

1. ✅ `user_profiles` - Profils utilisateurs
2. ✅ `patients` - Dossiers patients
3. ✅ `pharmacies` - Profils pharmacies
4. ✅ `doctors` - Profils médecins
5. ✅ `drivers` - Profils livreurs
6. ✅ `insurers` - Profils assureurs
7. ✅ `orders` - Commandes
8. ✅ `prescriptions` - Ordonnances
9. ✅ `appointments` - Rendez-vous
10. ✅ `messages` - Messages
11. ✅ `pharmacy_inventory` - Inventaire pharmacies
12. ✅ `cart_items` - Paniers

### Politiques de Sécurité

#### **USER_PROFILES**
```sql
-- Utilisateurs peuvent voir leur propre profil
Users can view own profile
USING (auth.uid() = user_id)

-- Utilisateurs peuvent mettre à jour leur propre profil
Users can update own profile
USING (auth.uid() = user_id)
```

#### **PATIENTS**
```sql
-- Patients peuvent voir leur propre dossier
Patients can view own record
USING (auth.uid() = user_id)

-- Médecins peuvent voir leurs patients
Doctors can view their patients
USING (EXISTS rendez-vous avec le médecin)
```

#### **ORDERS (Commandes)**
```sql
-- Patients voient leurs commandes
Patients can view own orders
USING (auth.uid() = patient_id)

-- Pharmacies voient leurs commandes
Pharmacies can view their orders
USING (pharmacy_id correspond à l'utilisateur)

-- Livreurs voient leurs livraisons
Drivers can view assigned orders
USING (auth.uid() = driver_id)
```

#### **PRESCRIPTIONS (Ordonnances)**
```sql
-- Patients voient leurs ordonnances
Patients can view own prescriptions
USING (auth.uid() = patient_id)

-- Médecins voient leurs ordonnances
Doctors can view own prescriptions
USING (auth.uid() = doctor_id)

-- Pharmacies voient toutes les ordonnances (validation)
Pharmacies can view all prescriptions
USING (role = 'pharmacy')
```

#### **APPOINTMENTS (Rendez-vous)**
```sql
-- Patients voient leurs rendez-vous
Patients can view own appointments
USING (patient_id correspond à l'utilisateur)

-- Médecins voient leurs rendez-vous
Doctors can view own appointments
USING (auth.uid() = doctor_id)
```

#### **MESSAGES**
```sql
-- Utilisateurs voient messages envoyés
Users can view sent messages
USING (auth.uid() = sender_id)

-- Utilisateurs voient messages reçus
Users can view received messages
USING (auth.uid() = receiver_id)
```

### Tables Publiques (Lecture Seule)

Certaines tables sont visibles par tous pour permettre la recherche :

1. ✅ `pharmacies` - Liste des pharmacies
2. ✅ `doctors` - Liste des médecins
3. ✅ `pharmacy_inventory` - Produits disponibles

**Note** : Seuls les propriétaires peuvent modifier leurs propres données.

## 3. Flux d'Authentification

### Connexion
1. Utilisateur clique sur "Profils"
2. Sélection du type de profil (Patient, Pharmacie, etc.)
3. Authentification via Supabase Auth
4. Création/Mise à jour du profil
5. Redirection vers le dashboard approprié

### Session Active
1. Header affiche l'avatar et le nom
2. Badge de rôle visible
3. Accès au dashboard via le menu
4. Données filtrées par RLS automatiquement

### Déconnexion
1. Clic sur "Déconnexion" dans le menu
2. Supabase.auth.signOut()
3. Toast de confirmation
4. Redirection vers la page d'accueil

## 4. Protection des Données

### Niveau Application
```typescript
// Utilisation du hook useAuth
const { user, profile } = useAuth()

// Vérification de l'utilisateur
if (!user) {
  navigate('/auth')
  return
}

// Accès aux données de l'utilisateur
const userId = user.id
const userRole = profile.role
```

### Niveau Base de Données
```sql
-- RLS appliqué automatiquement
SELECT * FROM orders
-- Retourne uniquement les commandes de l'utilisateur connecté

-- Impossible d'accéder aux données d'autres utilisateurs
SELECT * FROM orders WHERE patient_id = 'autre-user-id'
-- Retourne 0 résultats (bloqué par RLS)
```

### Niveau API
```typescript
// Supabase applique RLS automatiquement
const { data, error } = await supabase
  .from('orders')
  .select('*')
// Retourne uniquement les données autorisées par RLS
```

## 5. Rôles et Permissions

### Patient
- ✅ Voir ses commandes
- ✅ Voir ses ordonnances
- ✅ Voir ses rendez-vous
- ✅ Voir ses messages
- ✅ Gérer son panier
- ❌ Voir les données d'autres patients

### Pharmacie
- ✅ Voir son profil
- ✅ Voir ses commandes
- ✅ Voir toutes les ordonnances (validation)
- ✅ Gérer son inventaire
- ❌ Voir les données d'autres pharmacies

### Médecin
- ✅ Voir son profil
- ✅ Voir ses patients (via rendez-vous)
- ✅ Voir ses rendez-vous
- ✅ Créer des ordonnances
- ❌ Voir les données d'autres médecins

### Livreur
- ✅ Voir son profil
- ✅ Voir ses livraisons assignées
- ✅ Mettre à jour le statut de livraison
- ❌ Voir les livraisons d'autres livreurs

### Assureur
- ✅ Voir son profil
- ✅ Voir les demandes de remboursement
- ❌ Voir les données d'autres assureurs

## 6. Implémentation

### Appliquer les Politiques RLS

Pour appliquer les politiques de sécurité à votre base de données Supabase :

1. **Via Supabase Dashboard** :
   - Allez dans SQL Editor
   - Copiez le contenu de `supabase/migrations/20260128_implement_rls_security.sql`
   - Exécutez le script

2. **Via CLI Supabase** :
   ```bash
   supabase db push
   ```

3. **Vérifier les politiques** :
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename, policyname;
   ```

### Tester la Sécurité

#### Test 1 : Isolation des Données
```typescript
// Connecté en tant que Patient A
const { data } = await supabase.from('orders').select('*')
// Retourne uniquement les commandes du Patient A

// Impossible d'accéder aux commandes du Patient B
const { data: otherData } = await supabase
  .from('orders')
  .select('*')
  .eq('patient_id', 'patient-b-id')
// Retourne [] (vide)
```

#### Test 2 : Permissions Croisées
```typescript
// Connecté en tant que Médecin
const { data } = await supabase.from('appointments').select('*')
// Retourne uniquement les rendez-vous du médecin

// Peut voir les patients via les rendez-vous
const { data: patients } = await supabase
  .from('patients')
  .select('*')
  .in('id', appointmentPatientIds)
// Retourne uniquement les patients avec rendez-vous
```

## 7. Bonnes Pratiques

### ✅ À FAIRE
1. **Toujours utiliser RLS** pour toutes les tables sensibles
2. **Tester les politiques** avec différents rôles
3. **Vérifier l'authentification** avant d'accéder aux données
4. **Utiliser `auth.uid()`** dans les politiques RLS
5. **Logger les tentatives d'accès** non autorisées

### ❌ À NE PAS FAIRE
1. **Ne jamais désactiver RLS** sur les tables de production
2. **Ne pas faire confiance** aux données côté client
3. **Ne pas exposer** les IDs d'autres utilisateurs
4. **Ne pas utiliser** de politiques trop permissives
5. **Ne pas oublier** de tester avec différents rôles

## 8. Dépannage

### Problème : Utilisateur ne voit pas ses données
**Solution** :
1. Vérifier que RLS est activé : `SELECT * FROM pg_tables WHERE tablename = 'nom_table'`
2. Vérifier les politiques : `SELECT * FROM pg_policies WHERE tablename = 'nom_table'`
3. Vérifier l'authentification : `SELECT auth.uid()`

### Problème : Erreur "new row violates row-level security policy"
**Solution** :
1. Vérifier la politique INSERT/UPDATE
2. S'assurer que `WITH CHECK` est correct
3. Vérifier que `user_id` correspond à `auth.uid()`

### Problème : Utilisateur voit trop de données
**Solution** :
1. Revoir les politiques SELECT
2. Vérifier les conditions `USING`
3. Tester avec `EXPLAIN` pour voir les filtres appliqués

## 9. Monitoring

### Vérifier les Accès
```sql
-- Voir les politiques actives
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Tester une politique
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'user-id-here';
SELECT * FROM orders;
```

### Logs d'Audit
```typescript
// Logger les accès importants
const logAccess = async (action: string, resource: string) => {
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action,
    resource,
    timestamp: new Date()
  })
}
```

## 10. Ressources

### Documentation
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### Fichiers Importants
- `src/components/Header.tsx` - Affichage utilisateur
- `src/hooks/useAuth.ts` - Hook d'authentification
- `supabase/migrations/20260128_implement_rls_security.sql` - Politiques RLS

---

**Sécurité implémentée avec succès! 🔒**

Chaque utilisateur ne peut maintenant accéder qu'à ses propres données, et le header affiche clairement qui est connecté.
