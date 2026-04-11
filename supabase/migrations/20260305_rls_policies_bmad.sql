-- =================================================================================
-- RLS POLICIES FOR BMAD FEATURES PRE-PRODUCTION RECOMMENDATIONS
-- =================================================================================

-- 1. Family Profiles
-- Ensure users can only view and edit their own family profiles
ALTER TABLE IF EXISTS public.family_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own family profiles" on public.family_profiles;
CREATE POLICY "Users can view own family profiles"
  ON public.family_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own family profiles" on public.family_profiles;
CREATE POLICY "Users can insert own family profiles"
  ON public.family_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own family profiles" on public.family_profiles;
CREATE POLICY "Users can update own family profiles"
  ON public.family_profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own family profiles" on public.family_profiles;
CREATE POLICY "Users can delete own family profiles"
  ON public.family_profiles FOR DELETE
  USING (auth.uid() = user_id);


-- 2. Health Metrics (eCarnet)
-- Ensure users can only view and edit their own health metrics
ALTER TABLE IF EXISTS public.health_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own health metrics" on public.health_metrics;
CREATE POLICY "Users can view own health metrics"
  ON public.health_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_profiles fp 
      WHERE fp.id = health_metrics.patient_id 
      AND fp.user_id = auth.uid()
    )
    OR patient_id::text = auth.uid()::text -- fallback if metric is directly tied to user
  );


-- 3. Orders / PharmaGo+ Subscriptions
-- Ensure users can only view their own orders/subscriptions
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" on public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" on public.orders;
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Updates/Deletes on orders might be restricted to Admin/Pharmacy roles,
-- so we only grant SELECT and INSERT for regular users.
