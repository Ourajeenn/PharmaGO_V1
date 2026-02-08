// ============================================
// DASHBOARD TYPES - Shared TypeScript Interfaces
// ============================================

// ============================================
// ORDER TYPES (Flexible to match various data sources)
// ============================================

export interface OrderItem {
    id?: string;
    medicine_id?: string;
    medicine_name?: string;
    quantity?: number;
    unit_price?: number;
    total_price?: number;
    [key: string]: unknown; // Allow additional properties
}

export interface Order {
    id: string;
    user_id?: string;
    patient?: string;
    patient_name?: string;
    status: string;
    total?: number;
    total_amount?: number;
    items?: OrderItem[] | number;
    pharmacy_id?: string;
    pharmacy?: string;
    pharmacy_name?: string;
    driver_id?: string;
    driver?: string;
    driver_name?: string;
    address?: string;
    delivery_address?: string;
    phone?: string;
    delivery_fee?: number;
    payment_method?: string;
    payment_status?: string;
    notes?: string;
    time?: string;
    date?: string;
    created_at?: string;
    updated_at?: string;
    estimated_delivery?: string;
    delivered_at?: string;
    [key: string]: unknown; // Allow additional properties
}

// ============================================
// INVENTORY TYPES (Flexible)
// ============================================

export interface InventoryItem {
    id: string;
    pharmacy_id?: string;
    medicine_id?: string;
    medicine_name?: string;
    name?: string;
    category?: string;
    quantity?: number;
    stock?: number;
    minStock?: number;
    unit_price?: number;
    price?: number;
    wholesale_price?: number;
    expiry_date?: string;
    expiry?: string;
    batch_number?: string;
    reorder_level?: number;
    auto_reorder?: boolean;
    supplier_id?: string;
    last_restocked?: string;
    status?: string;
    [key: string]: unknown;
}

// ============================================
// DELIVERY TYPES
// ============================================

export interface Delivery {
    id: string;
    order_id?: string;
    driver_id?: string;
    status: string;
    pickup_address?: string;
    delivery_address?: string;
    pickup_time?: string;
    delivery_time?: string;
    estimated_duration?: number;
    distance?: number;
    fee?: number;
    notes?: string;
    signature_url?: string;
    photo_proof_url?: string;
    customer_name?: string;
    customer_phone?: string;
    pharmacy_name?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

// ============================================
// INSURANCE / CLAIM TYPES
// ============================================

export interface InsuranceClaim {
    id: string;
    patient_id?: string;
    patient_name?: string;
    policy_number?: string;
    claim_type?: string;
    amount?: number;
    coverage_percentage?: number;
    covered_amount?: number;
    status: string;
    submitted_at?: string;
    processed_at?: string;
    documents?: string[];
    notes?: string;
    rejection_reason?: string;
    [key: string]: unknown;
}

// ============================================
// PATIENT TYPES
// ============================================

export interface PatientRecord {
    id: string;
    user_id?: string;
    name?: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
    allergies?: string[];
    chronic_conditions?: string[];
    address?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

// ============================================
// PRESCRIPTION TYPES
// ============================================

export interface Prescription {
    id: string;
    patient_id?: string;
    patient_name?: string;
    doctor_id?: string;
    doctor_name?: string;
    medications?: PrescriptionMedication[];
    diagnosis?: string;
    notes?: string;
    status: string;
    valid_until?: string;
    created_at?: string;
    filled_at?: string;
    pharmacy_id?: string;
    pharmacy_name?: string;
    [key: string]: unknown;
}

export interface PrescriptionMedication {
    medicine_id?: string;
    medicine_name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    quantity?: number;
    instructions?: string;
    is_substitutable?: boolean;
    [key: string]: unknown;
}

// ============================================
// APPOINTMENT TYPES
// ============================================

export interface Appointment {
    id: string;
    patient_id?: string;
    patient_name?: string;
    doctor_id?: string;
    doctor_name?: string;
    type?: string;
    status: string;
    scheduled_at?: string;
    duration_minutes?: number;
    reason?: string;
    notes?: string;
    location?: string;
    video_link?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

// ============================================
// USER TYPES
// ============================================

export interface UserProfile {
    id: string;
    email?: string;
    name?: string;
    phone?: string;
    role?: string;
    avatar_url?: string;
    is_verified?: boolean;
    status?: string;
    joinedAt?: string;
    last_login?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DashboardMetric {
    id: string;
    label: string;
    value: number;
    change_percentage?: number;
    trend?: string;
    period?: string;
    icon?: string;
    color?: string;
}

// ============================================
// AUDIT TYPES
// ============================================

export interface AuditLogEntry {
    id: string;
    user_id?: string;
    user_name?: string;
    user_role?: string;
    action: string;
    resource_type?: string;
    resource_id?: string;
    details?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    status: string;
    timestamp: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
    id: string;
    user_id?: string;
    type?: string;
    title: string;
    message: string;
    is_read?: boolean;
    action_url?: string;
    created_at?: string;
    read_at?: string;
}
