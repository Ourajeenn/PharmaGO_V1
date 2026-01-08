--Déclencheur amélioré pour l'enregistrement des utilisateurs
-- Cette migration met à jour la fonction handle_new_user afin de remplir automatiquement 
-- les tables spécifiques aux rôles (chauffeurs, médecins, pharmacies, etc.) à l'aide des données provenant de raw_user_meta_data.
-- Cela résout les problèmes liés au RLS lorsque la confirmation par e-mail est activée (la session est nulle lors de l'inscription).

Traduit avec DeepL.com (version gratuite)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
BEGIN
  -- Determine role (default to patient)
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'patient'::public.user_role);

  -- 1. Create User Profile
  INSERT INTO public.user_profiles (id, name, role, email, phone, verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    v_role,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'phone',
    false
  )
  ON CONFLICT (id) DO NOTHING;

  -- 1.1 Create User Role mapping
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT DO NOTHING;

  -- 2. Create Role-Specific Entry based on v_role
  CASE v_role
    WHEN 'patient' THEN
      INSERT INTO public.patients (user_id, insurance_id, cmu_number, address)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'insurance_id',
        NEW.raw_user_meta_data->>'cmu_number',
        NEW.raw_user_meta_data->>'address'
      )
      ON CONFLICT (user_id) DO NOTHING;

    WHEN 'driver' THEN
      INSERT INTO public.drivers (user_id, vehicle_type, license_plate, experience_years, verified, available)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'vehicle_type',
        NEW.raw_user_meta_data->>'license_plate',
        (NEW.raw_user_meta_data->>'experience_years')::integer,
        false,
        false
      )
      ON CONFLICT (user_id) DO NOTHING;

    WHEN 'pharmacy' THEN
      INSERT INTO public.pharmacies (id, user_id, name, address, license_number, verified, is_on_duty)
      VALUES (
        gen_random_uuid(),
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Pharmacie Sans Nom'),
        COALESCE(NEW.raw_user_meta_data->>'clinic_address', 'Adresse non renseignée'),
        NEW.raw_user_meta_data->>'license_number',
        false,
        false
      )
      ON CONFLICT DO NOTHING; -- Note: pharmacies PK is uuid, not user_id, but user_id is unique FK usually? 
      -- Actually pharmacies PK is 'id'. user_id is a column. 
      -- We depend on the default gen_random_uuid() for id.
      -- To avoid duplicates if called multiple times, we would need a unique constraint on user_id in pharmacies, which exists in logic but maybe not constraint.
      
    WHEN 'doctor' THEN
      INSERT INTO public.doctors (user_id, license_number, specialization, clinic_name, clinic_address, verified)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING'),
        NEW.raw_user_meta_data->>'specialization',
        NEW.raw_user_meta_data->>'clinic_name',
        NEW.raw_user_meta_data->>'clinic_address',
        false
      )
      ON CONFLICT (user_id) DO NOTHING;

    WHEN 'insurer' THEN
      INSERT INTO public.insurers (user_id, company_name, license_number, verified)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'company_name', COALESCE(NEW.raw_user_meta_data->>'name', 'Assurance Sans Nom')),
        COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING'),
        false
      )
      ON CONFLICT (user_id) DO NOTHING;

    ELSE
      -- Do nothing for other roles
      NULL;
  END CASE;

  RETURN NEW;
END;
$$;

-- Ensure the trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
