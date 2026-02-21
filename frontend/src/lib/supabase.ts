import { supabase as supabaseClient } from "@/integrations/supabase/client";

export const supabase = supabaseClient as any;

export type UserRole = 'patient' | 'pharmacy' | 'driver' | 'admin' | 'doctor' | 'insurer'

export interface UserProfile {
  id: string
  role: UserRole
  name: string
  email: string
  phone?: string
  verified: boolean
  created_at: string
  avatar_url?: string
  birth_date?: string
  gender?: 'male' | 'female' | 'other'
  loyalty_points?: number
}

export interface Patient {
  user_id: string
  date_of_birth?: string
  insurance_id?: string
  insurance_card_scan?: string
  cmu_number?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Pharmacy {
  id: string
  user_id: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  is_on_duty: boolean
  license_number?: string
  verified: boolean
  opening_hours?: any
  created_at: string
  updated_at: string
}

export interface Driver {
  user_id: string
  cni_scan?: string
  permit_scan?: string
  vehicle_type?: string
  license_plate?: string
  experience_years?: number
  verified: boolean
  available: boolean
  current_latitude?: number
  current_longitude?: number
  created_at: string
  updated_at: string
}

export interface Doctor {
  user_id: string
  license_number: string
  specialization?: string
  clinic_name?: string
  clinic_address?: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Insurer {
  user_id: string
  company_name: string
  license_number: string
  coverage_types?: any
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Medicine {
  id: string
  name: string
  generic_name?: string
  dosage?: string
  form?: string
  description?: string
  requires_prescription: boolean
  category?: string
  manufacturer?: string
  // AIRP-specific fields
  amm_number?: string
  amm_acquisition_date?: string
  amm_expiration_date?: string
  dci?: string // Dénomination Commune Internationale
  country_of_origin?: string
  rcp_url?: string // Résumé des Caractéristiques du Produit
  notice_url?: string
  product_type?: 'medication' | 'phytomedicine' | 'supplement'
  airp_source?: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  patient_id: string
  pharmacy_id?: string
  doctor_id?: string
  driver_id?: string
  prescription_id?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'
  total: number
  insurance_coverage?: number
  patient_payment: number
  payment_method?: 'cash' | 'orange_money' | 'wave' | 'card'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  delivery_address: string
  delivery_latitude?: number
  delivery_longitude?: number
  notes?: string
  created_at: string
  updated_at: string
}