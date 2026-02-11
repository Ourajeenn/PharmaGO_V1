-- ==========================================
-- SUPER FIX SQL : RÉPARATION TOTALE DES ACCÈS
-- ==========================================
-- Copiez et exécutez TOUT ce script dans votre SQL Editor Supabase.

-- 1. TABLE : user_profiles (La plus importante)
-----------------------------------------------
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
-- Nettoyage de toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_owner_access" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage any profile" ON public.user_profiles;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Nouvelle politique unique "TOUT-EN-UN" pour l'utilisateur
CREATE POLICY "user_profiles_owner_policy" 
ON public.user_profiles FOR ALL TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Nouvelle politique Admin (Utilise le JWT pour éviter les boucles infinies)
CREATE POLICY "user_profiles_admin_policy" 
ON public.user_profiles FOR ALL TO authenticated 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');


-- 2. TABLE : user_roles
------------------------
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_owner_access" ON public.user_roles;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_owner_policy" 
ON public.user_roles FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);


-- 3. TABLES SPÉCIFIQUES (Drivers, Patients, etc.)
--------------------------------------------------
-- Driver
ALTER TABLE public.drivers DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Drivers can insert own" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can insert their own profile" ON public.drivers;
DROP POLICY IF EXISTS "drivers_owner_access" ON public.drivers;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drivers_owner_policy" 
ON public.drivers FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Patient
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Patients can insert own" ON public.patients;
DROP POLICY IF EXISTS "Users can insert their own patient profile" ON public.patients;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_owner_policy" 
ON public.patients FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Répétez pour les autres si besoin, mais ceci couvre les cas bloqués actuels.
