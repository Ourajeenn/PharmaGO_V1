-- =====================================================
-- SÉCURITÉ RLS (ROW LEVEL SECURITY) - PHARMAGO
-- =====================================================
-- Ce fichier implémente la sécurité au niveau des lignes
-- pour garantir que chaque utilisateur n'accède qu'à ses propres données
-- =====================================================

-- 1. ACTIVER RLS SUR TOUTES LES TABLES PRINCIPALES
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 2. POLITIQUES POUR USER_PROFILES
-- =====================================================

-- Utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Utilisateurs peuvent insérer leur propre profil
CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. POLITIQUES POUR PATIENTS
-- =====================================================

-- Patients peuvent voir leur propre dossier
CREATE POLICY "Patients can view own record"
ON patients FOR SELECT
USING (auth.uid() = user_id);

-- Médecins peuvent voir les patients qui ont des rendez-vous avec eux
CREATE POLICY "Doctors can view their patients"
ON patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.patient_id = patients.id
    AND appointments.doctor_id = auth.uid()
  )
);

-- Patients peuvent mettre à jour leur propre dossier
CREATE POLICY "Patients can update own record"
ON patients FOR UPDATE
USING (auth.uid() = user_id);

-- 4. POLITIQUES POUR PHARMACIES
-- =====================================================

-- Pharmacies peuvent voir leur propre profil
CREATE POLICY "Pharmacies can view own profile"
ON pharmacies FOR SELECT
USING (auth.uid() = user_id);

-- Tout le monde peut voir les pharmacies (pour la recherche)
CREATE POLICY "Anyone can view pharmacies"
ON pharmacies FOR SELECT
USING (true);

-- Pharmacies peuvent mettre à jour leur propre profil
CREATE POLICY "Pharmacies can update own profile"
ON pharmacies FOR UPDATE
USING (auth.uid() = user_id);

-- 5. POLITIQUES POUR DOCTORS
-- =====================================================

-- Médecins peuvent voir leur propre profil
CREATE POLICY "Doctors can view own profile"
ON doctors FOR SELECT
USING (auth.uid() = user_id);

-- Tout le monde peut voir les médecins (pour la recherche)
CREATE POLICY "Anyone can view doctors"
ON doctors FOR SELECT
USING (true);

-- Médecins peuvent mettre à jour leur propre profil
CREATE POLICY "Doctors can update own profile"
ON doctors FOR UPDATE
USING (auth.uid() = user_id);

-- 6. POLITIQUES POUR DRIVERS
-- =====================================================

-- Livreurs peuvent voir leur propre profil
CREATE POLICY "Drivers can view own profile"
ON drivers FOR SELECT
USING (auth.uid() = user_id);

-- Livreurs peuvent mettre à jour leur propre profil
CREATE POLICY "Drivers can update own profile"
ON drivers FOR UPDATE
USING (auth.uid() = user_id);

-- 7. POLITIQUES POUR ORDERS
-- =====================================================

-- Patients peuvent voir leurs propres commandes
CREATE POLICY "Patients can view own orders"
ON orders FOR SELECT
USING (auth.uid() = patient_id);

-- Pharmacies peuvent voir les commandes qui leur sont destinées
CREATE POLICY "Pharmacies can view their orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pharmacies
    WHERE pharmacies.id = orders.pharmacy_id
    AND pharmacies.user_id = auth.uid()
  )
);

-- Livreurs peuvent voir les commandes qui leur sont assignées
CREATE POLICY "Drivers can view assigned orders"
ON orders FOR SELECT
USING (auth.uid() = driver_id);

-- Patients peuvent créer des commandes
CREATE POLICY "Patients can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = patient_id);

-- Patients peuvent mettre à jour leurs propres commandes
CREATE POLICY "Patients can update own orders"
ON orders FOR UPDATE
USING (auth.uid() = patient_id);

-- Pharmacies peuvent mettre à jour les commandes qui leur sont destinées
CREATE POLICY "Pharmacies can update their orders"
ON orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM pharmacies
    WHERE pharmacies.id = orders.pharmacy_id
    AND pharmacies.user_id = auth.uid()
  )
);

-- Livreurs peuvent mettre à jour les commandes qui leur sont assignées
CREATE POLICY "Drivers can update assigned orders"
ON orders FOR UPDATE
USING (auth.uid() = driver_id);

-- 8. POLITIQUES POUR PRESCRIPTIONS
-- =====================================================

-- Patients peuvent voir leurs propres ordonnances
CREATE POLICY "Patients can view own prescriptions"
ON prescriptions FOR SELECT
USING (auth.uid() = patient_id);

-- Médecins peuvent voir les ordonnances qu'ils ont créées
CREATE POLICY "Doctors can view own prescriptions"
ON prescriptions FOR SELECT
USING (auth.uid() = doctor_id);

-- Pharmacies peuvent voir toutes les ordonnances (pour validation)
CREATE POLICY "Pharmacies can view all prescriptions"
ON prescriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'pharmacy'
  )
);

-- Médecins peuvent créer des ordonnances
CREATE POLICY "Doctors can create prescriptions"
ON prescriptions FOR INSERT
WITH CHECK (auth.uid() = doctor_id);

-- Médecins peuvent mettre à jour leurs propres ordonnances
CREATE POLICY "Doctors can update own prescriptions"
ON prescriptions FOR UPDATE
USING (auth.uid() = doctor_id);

-- 9. POLITIQUES POUR APPOINTMENTS
-- =====================================================

-- Patients peuvent voir leurs propres rendez-vous
CREATE POLICY "Patients can view own appointments"
ON appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = appointments.patient_id
    AND patients.user_id = auth.uid()
  )
);

-- Médecins peuvent voir leurs propres rendez-vous
CREATE POLICY "Doctors can view own appointments"
ON appointments FOR SELECT
USING (auth.uid() = doctor_id);

-- Patients peuvent créer des rendez-vous
CREATE POLICY "Patients can create appointments"
ON appointments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = appointments.patient_id
    AND patients.user_id = auth.uid()
  )
);

-- Patients peuvent mettre à jour leurs propres rendez-vous
CREATE POLICY "Patients can update own appointments"
ON appointments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = appointments.patient_id
    AND patients.user_id = auth.uid()
  )
);

-- Médecins peuvent mettre à jour leurs propres rendez-vous
CREATE POLICY "Doctors can update own appointments"
ON appointments FOR UPDATE
USING (auth.uid() = doctor_id);

-- 10. POLITIQUES POUR MESSAGES
-- =====================================================

-- Utilisateurs peuvent voir les messages qu'ils ont envoyés
CREATE POLICY "Users can view sent messages"
ON messages FOR SELECT
USING (auth.uid() = sender_id);

-- Utilisateurs peuvent voir les messages qu'ils ont reçus
CREATE POLICY "Users can view received messages"
ON messages FOR SELECT
USING (auth.uid() = receiver_id);

-- Utilisateurs peuvent envoyer des messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Utilisateurs peuvent mettre à jour les messages qu'ils ont reçus (marquer comme lu)
CREATE POLICY "Users can update received messages"
ON messages FOR UPDATE
USING (auth.uid() = receiver_id);

-- 11. POLITIQUES POUR PHARMACY_INVENTORY
-- =====================================================

-- Pharmacies peuvent voir leur propre inventaire
CREATE POLICY "Pharmacies can view own inventory"
ON pharmacy_inventory FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pharmacies
    WHERE pharmacies.id = pharmacy_inventory.pharmacy_id
    AND pharmacies.user_id = auth.uid()
  )
);

-- Tout le monde peut voir l'inventaire (pour la recherche de produits)
CREATE POLICY "Anyone can view inventory"
ON pharmacy_inventory FOR SELECT
USING (true);

-- Pharmacies peuvent gérer leur propre inventaire
CREATE POLICY "Pharmacies can manage own inventory"
ON pharmacy_inventory FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pharmacies
    WHERE pharmacies.id = pharmacy_inventory.pharmacy_id
    AND pharmacies.user_id = auth.uid()
  )
);

-- 12. POLITIQUES POUR CART_ITEMS
-- =====================================================

-- Utilisateurs peuvent voir leur propre panier
CREATE POLICY "Users can view own cart"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);

-- Utilisateurs peuvent gérer leur propre panier
CREATE POLICY "Users can manage own cart"
ON cart_items FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 13. POLITIQUES POUR INSURERS
-- =====================================================

-- Assureurs peuvent voir leur propre profil
CREATE POLICY "Insurers can view own profile"
ON insurers FOR SELECT
USING (auth.uid() = user_id);

-- Assureurs peuvent mettre à jour leur propre profil
CREATE POLICY "Insurers can update own profile"
ON insurers FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================
-- 1. Ces politiques garantissent que chaque utilisateur
--    ne peut accéder qu'à ses propres données
-- 2. Certaines tables (pharmacies, doctors) sont visibles
--    par tous pour permettre la recherche
-- 3. Les relations entre tables sont respectées
--    (ex: un médecin peut voir ses patients via les rendez-vous)
-- 4. Les administrateurs peuvent avoir des politiques spéciales
--    si nécessaire (à ajouter selon les besoins)
-- =====================================================

-- Pour vérifier les politiques RLS actives :
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
