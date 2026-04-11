-- ==============================================================================
-- 1. Enable RLS on all relevant tables
-- ==============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. Public Read Policies (For Frontend Access)
-- ==============================================================================

-- Allow everyone to view basic user profiles (needed for joins)
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (true);

-- Allow everyone to view pharmacies
CREATE POLICY "Public pharmacies are viewable by everyone" ON pharmacies
    FOR SELECT USING (true);

-- Allow everyone to view medicines catalog
CREATE POLICY "Public medicines are viewable by everyone" ON medicines
    FOR SELECT USING (true);

-- Allow everyone to view inventory (stock)
CREATE POLICY "Public inventory is viewable by everyone" ON pharmacy_inventory
    FOR SELECT USING (true);

-- ==============================================================================
-- 3. Pharmacy Owner Policies (For Management)
-- ==============================================================================

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow pharmacies to insert/update their own data
CREATE POLICY "Pharmacies can manage own details" ON pharmacies
    FOR ALL USING (auth.uid() = user_id);

-- Allow pharmacies to manage their inventory
CREATE POLICY "Pharmacies can manage own inventory" ON pharmacy_inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pharmacies 
            WHERE pharmacies.id = pharmacy_inventory.pharmacy_id 
            AND pharmacies.user_id = auth.uid()
        )
    );
