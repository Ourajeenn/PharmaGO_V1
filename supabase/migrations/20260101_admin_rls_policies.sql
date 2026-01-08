-- Enable RLS on user_profiles if not already enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for Admins to manage all profiles
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update all profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can delete all profiles"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for specific role tables (patients, pharmacies, etc.) for Admins

-- Patients
CREATE POLICY "Admins can view all patients" ON public.patients FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update all patients" ON public.patients FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete all patients" ON public.patients FOR DELETE TO authenticated USING (is_admin());

-- Pharmacies
CREATE POLICY "Admins can view all pharmacies" ON public.pharmacies FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert pharmacies" ON public.pharmacies FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update all pharmacies" ON public.pharmacies FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete all pharmacies" ON public.pharmacies FOR DELETE TO authenticated USING (is_admin());

-- Doctors
CREATE POLICY "Admins can view all doctors" ON public.doctors FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert doctors" ON public.doctors FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update all doctors" ON public.doctors FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete all doctors" ON public.doctors FOR DELETE TO authenticated USING (is_admin());

-- Drivers
CREATE POLICY "Admins can view all drivers" ON public.drivers FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert drivers" ON public.drivers FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update all drivers" ON public.drivers FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete all drivers" ON public.drivers FOR DELETE TO authenticated USING (is_admin());

-- Insurers
CREATE POLICY "Admins can view all insurers" ON public.insurers FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert insurers" ON public.insurers FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update all insurers" ON public.insurers FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete all insurers" ON public.insurers FOR DELETE TO authenticated USING (is_admin());
