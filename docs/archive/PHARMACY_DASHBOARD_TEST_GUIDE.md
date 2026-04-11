# Guide de Test - Dashboard Pharmacie

## 🚀 Démarrage Rapide

### 1. Démarrer le serveur de développement

```bash
cd c:\Users\jenra\Downloads\PHARMA-GO_FINALE\pharma-go-express-main
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:5173`

### 2. Se connecter avec un compte pharmacie

Pour voir le nouveau dashboard, vous devez vous connecter avec un compte ayant le rôle **"pharmacy"**.

**Comptes de test suggérés :**
- Email: `pharmacy@test.com`
- Password: `test123` (ou votre mot de passe de test)

### 3. Navigation

Une fois connecté, vous serez automatiquement redirigé vers le dashboard pharmacie si votre profil a le rôle "pharmacy".

## 📋 Fonctionnalités à Tester

### ✅ Sidebar Navigation
- [ ] Cliquer sur "Dashboard" (devrait être actif par défaut)
- [ ] Cliquer sur "Products"
- [ ] Cliquer sur "Categories"
- [ ] Cliquer sur "Orders" dans la section Leads
- [ ] Cliquer sur "Sales"
- [ ] Cliquer sur "Customers"
- [ ] Cliquer sur "Payments" dans la section Comms
- [ ] Cliquer sur "Reports"
- [ ] Cliquer sur "Settings"
- [ ] Vérifier le widget de complétion de profil en bas

### ✅ Header
- [ ] Utiliser la barre de recherche
- [ ] Cliquer sur l'icône de notification (badge rouge)
- [ ] Changer la langue (EN dropdown)
- [ ] Cliquer sur le profil utilisateur
- [ ] Vérifier le badge "Team Member"

### ✅ Stats Cards
- [ ] Vérifier que "Today's Sales" affiche les ventes du jour
- [ ] Vérifier "Available Categories" (nombre de catégories)
- [ ] Vérifier "Expired Medicines" (médicaments expirés)
- [ ] Vérifier "System Users" (nombre d'utilisateurs)
- [ ] Cliquer sur le menu "..." de chaque carte

### ✅ Graph Report (Donut Chart)
- [ ] Vérifier que le graphique s'affiche correctement
- [ ] Vérifier le total au centre (755K)
- [ ] Vérifier la légende (Purchases, Suppliers, Sales, No Sales)

### ✅ Total Sales Overview (Bar Chart)
- [ ] Vérifier les barres pour chaque jour (Mon-Sat)
- [ ] Vérifier les couleurs et motifs diagonaux
- [ ] Vérifier le badge de valeur actuelle ($298.00K)

### ✅ Recent Sales List (Table)
- [ ] Utiliser la recherche pour filtrer les ventes
- [ ] Utiliser le filtre (Filter dropdown)
- [ ] Utiliser le tri (Sort By dropdown)
- [ ] Cliquer sur le bouton Edit (✏️) d'une vente
- [ ] Cliquer sur le bouton View (👁️) d'une vente
- [ ] Cliquer sur le bouton Delete (🗑️) d'une vente
- [ ] Tester la pagination (Prev/Next)
- [ ] Changer le nombre d'entrées affichées (Show: 3/5/10)
- [ ] Cocher les checkboxes de sélection

### ✅ Intégration Supabase
- [ ] Vérifier que les données réelles sont chargées depuis Supabase
- [ ] Vérifier que les ventes du jour sont calculées correctement
- [ ] Vérifier que les catégories sont comptées depuis l'inventaire
- [ ] Vérifier que les médicaments expirés sont détectés

## 🐛 Tests de Bugs Potentiels

### Responsive Design
- [ ] Tester sur écran large (1920px+)
- [ ] Tester sur écran moyen (1024px)
- [ ] Tester sur tablette (768px)
- [ ] Tester sur mobile (375px)

### Performance
- [ ] Vérifier le temps de chargement initial
- [ ] Vérifier la fluidité des animations
- [ ] Vérifier qu'il n'y a pas de lag lors du scroll
- [ ] Vérifier la réactivité des clics

### Erreurs
- [ ] Vérifier qu'il n'y a pas d'erreurs dans la console
- [ ] Vérifier que les toasts s'affichent correctement
- [ ] Vérifier la gestion des erreurs Supabase

## 📊 Données de Test

### Pour tester avec des données réelles :

1. **Créer des commandes de test** dans Supabase
2. **Ajouter des médicaments** à l'inventaire
3. **Définir des dates d'expiration** pour tester les alertes
4. **Créer plusieurs catégories** de médicaments

### Requêtes SQL utiles :

```sql
-- Voir toutes les commandes d'une pharmacie
SELECT * FROM orders WHERE pharmacy_id = 'YOUR_PHARMACY_ID';

-- Voir l'inventaire
SELECT * FROM pharmacy_inventory WHERE pharmacy_id = 'YOUR_PHARMACY_ID';

-- Compter les catégories
SELECT DISTINCT category FROM medicines;

-- Médicaments expirés
SELECT * FROM pharmacy_inventory 
WHERE expiry_date < CURRENT_DATE 
AND pharmacy_id = 'YOUR_PHARMACY_ID';
```

## 🎨 Vérifications Visuelles

### Couleurs
- [ ] Vert pour Today's Sales (#86efac)
- [ ] Cyan pour Available Categories (#67e8f9)
- [ ] Rose pour Expired Medicines (#fda4af)
- [ ] Violet pour System Users (#c4b5fd)
- [ ] Slate pour l'interface (#f8fafc, #1e293b)

### Typographie
- [ ] Titres en gras
- [ ] Stats en grande taille
- [ ] Labels en petite taille et uppercase
- [ ] Texte lisible et contrasté

### Effets
- [ ] Backdrop blur sur sidebar et header
- [ ] Gradients sur les cartes
- [ ] Hover effects sur les boutons
- [ ] Transitions douces
- [ ] Bordures arrondies

## 📝 Checklist de Validation Finale

- [ ] Le dashboard correspond à l'image de référence
- [ ] Toutes les fonctionnalités sont opérationnelles
- [ ] Les données Supabase sont chargées correctement
- [ ] Pas d'erreurs dans la console
- [ ] Le design est responsive
- [ ] Les animations sont fluides
- [ ] Les toasts fonctionnent
- [ ] La navigation fonctionne
- [ ] Les actions CRUD fonctionnent

## 🔧 Dépannage

### Le dashboard ne s'affiche pas
1. Vérifier que vous êtes connecté avec un compte "pharmacy"
2. Vérifier la console pour les erreurs
3. Vérifier que le serveur Vite est démarré
4. Vérifier la connexion Supabase

### Les données ne se chargent pas
1. Vérifier les credentials Supabase dans `.env`
2. Vérifier que la pharmacie existe dans la table `pharmacies`
3. Vérifier les logs de la console
4. Vérifier les RLS (Row Level Security) de Supabase

### Erreurs de compilation
1. Vérifier que toutes les dépendances sont installées (`npm install`)
2. Vérifier qu'il n'y a pas de conflits de versions
3. Nettoyer le cache (`npm run clean` ou supprimer `node_modules`)

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier la console du navigateur
2. Vérifier les logs du serveur
3. Consulter le fichier `PHARMACY_DASHBOARD_README.md`
4. Vérifier la documentation Supabase

---

**Bon test ! 🎉**
