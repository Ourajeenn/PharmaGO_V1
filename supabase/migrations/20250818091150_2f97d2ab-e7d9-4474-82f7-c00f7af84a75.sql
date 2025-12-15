-- Create additional tables for the pharmacy system
CREATE TABLE public.patients (
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date_of_birth DATE,
  insurance_id TEXT,
  insurance_card_scan TEXT,
  cmu_number TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

CREATE TABLE public.pharmacies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  is_on_duty BOOLEAN NOT NULL DEFAULT false,
  license_number TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  opening_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.drivers (
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  cni_scan TEXT,
  permit_scan TEXT,
  vehicle_type TEXT,
  license_plate TEXT,
  experience_years INTEGER,
  verified BOOLEAN NOT NULL DEFAULT false,
  available BOOLEAN NOT NULL DEFAULT false,
  current_latitude DECIMAL,
  current_longitude DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

CREATE TABLE public.doctors (
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL,
  specialization TEXT,
  clinic_name TEXT,
  clinic_address TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

CREATE TABLE public.insurers (
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  coverage_types JSONB,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT,
  form TEXT, -- tablet, syrup, injection, etc.
  description TEXT,
  requires_prescription BOOLEAN NOT NULL DEFAULT true,
  category TEXT,
  manufacturer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.pharmacy_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  expiry_date DATE,
  batch_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pharmacy_id, medicine_id, batch_number)
);

CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(user_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(user_id) ON DELETE CASCADE,
  prescription_text TEXT NOT NULL,
  qr_code TEXT,
  digital_signature TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(user_id) ON DELETE CASCADE,
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.doctors(user_id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(user_id) ON DELETE SET NULL,
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered', 'cancelled')),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  insurance_coverage DECIMAL(10,2) DEFAULT 0,
  patient_payment DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'orange_money', 'wave', 'card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  delivery_address TEXT NOT NULL,
  delivery_latitude DECIMAL,
  delivery_longitude DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  pharmacy_inventory_id UUID REFERENCES public.pharmacy_inventory(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.insurance_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  insurer_id UUID NOT NULL REFERENCES public.insurers(user_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(user_id) ON DELETE CASCADE,
  claim_amount DECIMAL(10,2) NOT NULL,
  coverage_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  approved_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.delivery_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(user_id) ON DELETE CASCADE,
  current_latitude DECIMAL,
  current_longitude DECIMAL,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered')),
  proof_of_delivery TEXT, -- photo or QR code
  delivery_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document')),
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients
CREATE POLICY "Users can view their own patient profile" ON public.patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own patient profile" ON public.patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own patient profile" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for pharmacies
CREATE POLICY "Pharmacies can view their own profile" ON public.pharmacies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Pharmacies can update their own profile" ON public.pharmacies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Pharmacies can insert their own profile" ON public.pharmacies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view verified pharmacies" ON public.pharmacies FOR SELECT USING (verified = true);

-- Create RLS policies for drivers
CREATE POLICY "Drivers can view their own profile" ON public.drivers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can update their own profile" ON public.drivers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Drivers can insert their own profile" ON public.drivers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for doctors
CREATE POLICY "Doctors can view their own profile" ON public.doctors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Doctors can update their own profile" ON public.doctors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Doctors can insert their own profile" ON public.doctors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for insurers
CREATE POLICY "Insurers can view their own profile" ON public.insurers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insurers can update their own profile" ON public.insurers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Insurers can insert their own profile" ON public.insurers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for medicines (public read)
CREATE POLICY "Anyone can view medicines" ON public.medicines FOR SELECT USING (true);
CREATE POLICY "Only pharmacies can manage medicines" ON public.medicines FOR ALL USING (
  EXISTS (SELECT 1 FROM public.pharmacies WHERE user_id = auth.uid() AND verified = true)
);

-- Create RLS policies for pharmacy inventory
CREATE POLICY "Pharmacies can manage their inventory" ON public.pharmacy_inventory FOR ALL USING (
  EXISTS (SELECT 1 FROM public.pharmacies WHERE id = pharmacy_id AND user_id = auth.uid())
);
CREATE POLICY "Public can view inventory for available medicines" ON public.pharmacy_inventory FOR SELECT USING (quantity > 0);

-- Create RLS policies for prescriptions
CREATE POLICY "Doctors can manage their prescriptions" ON public.prescriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.doctors WHERE user_id = doctor_id AND user_id = auth.uid())
);
CREATE POLICY "Patients can view their prescriptions" ON public.prescriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.patients WHERE user_id = patient_id AND user_id = auth.uid())
);

-- Create RLS policies for orders
CREATE POLICY "Patients can manage their orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.patients WHERE user_id = patient_id AND user_id = auth.uid())
);
CREATE POLICY "Pharmacies can view their orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pharmacies WHERE id = pharmacy_id AND user_id = auth.uid())
);
CREATE POLICY "Drivers can view assigned orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE user_id = driver_id AND user_id = auth.uid())
);

-- Create RLS policies for order items
CREATE POLICY "Users can view order items for their orders" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    LEFT JOIN public.patients p ON o.patient_id = p.user_id
    LEFT JOIN public.pharmacies ph ON o.pharmacy_id = ph.id
    LEFT JOIN public.drivers d ON o.driver_id = d.user_id
    WHERE o.id = order_id AND (
      p.user_id = auth.uid() OR ph.user_id = auth.uid() OR d.user_id = auth.uid()
    )
  )
);

-- Create RLS policies for insurance claims
CREATE POLICY "Insurers can manage their claims" ON public.insurance_claims FOR ALL USING (
  EXISTS (SELECT 1 FROM public.insurers WHERE user_id = insurer_id AND user_id = auth.uid())
);
CREATE POLICY "Patients can view their claims" ON public.insurance_claims FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.patients WHERE user_id = patient_id AND user_id = auth.uid())
);

-- Create RLS policies for delivery tracking
CREATE POLICY "Drivers can manage their deliveries" ON public.delivery_tracking FOR ALL USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE user_id = driver_id AND user_id = auth.uid())
);
CREATE POLICY "Patients can track their deliveries" ON public.delivery_tracking FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    JOIN public.patients p ON o.patient_id = p.user_id
    WHERE o.id = order_id AND p.user_id = auth.uid()
  )
);

-- Create RLS policies for messages
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create triggers for updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON public.pharmacies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_insurers_updated_at BEFORE UPDATE ON public.insurers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pharmacy_inventory_updated_at BEFORE UPDATE ON public.pharmacy_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON public.insurance_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_tracking_updated_at BEFORE UPDATE ON public.delivery_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_pharmacies_location ON public.pharmacies(latitude, longitude);
CREATE INDEX idx_pharmacy_inventory_medicine ON public.pharmacy_inventory(medicine_id);
CREATE INDEX idx_orders_patient ON public.orders(patient_id);
CREATE INDEX idx_orders_pharmacy ON public.orders(pharmacy_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_messages_order ON public.messages(order_id);

-- Insert some sample data
INSERT INTO public.medicines (name, generic_name, dosage, form, description, requires_prescription, category, manufacturer) VALUES
('Paracétamol', 'Paracétamol', '500mg', 'tablet', 'Analgésique et antipyrétique', false, 'Analgésiques', 'PharmaCorp'),
('Doliprane', 'Paracétamol', '1000mg', 'tablet', 'Analgésique et antipyrétique forte dose', false, 'Analgésiques', 'Sanofi'),
('Amoxicilline', 'Amoxicilline', '500mg', 'capsule', 'Antibiotique à large spectre', true, 'Antibiotiques', 'MediLab'),
('Aspirine', 'Acide acétylsalicylique', '100mg', 'tablet', 'Anti-inflammatoire et antiagrégant plaquettaire', false, 'Anti-inflammatoires', 'Bayer'),
('Oméprazole', 'Oméprazole', '20mg', 'capsule', 'Inhibiteur de la pompe à protons', true, 'Gastro-entérologie', 'GenericPharma');