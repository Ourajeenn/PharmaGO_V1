import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // 1) Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user!.id)
        }, 0)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    // 2) Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      // Récupérer le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Vérifier le rôle dans user_roles (sécurisé)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      if (roleError) {
        console.error('Error fetching role:', roleError)
      }

      // Utiliser le rôle de user_roles si disponible, sinon celui de user_profiles
      const finalProfile = {
        ...profileData,
        role: roleData?.role || profileData.role
      }

      setProfile(finalProfile)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: {
    name: string
    role: string
    phone?: string
    insurance_id?: string
    cmu_number?: string
    license_number?: string
    company_name?: string
    specialization?: string
    clinic_name?: string
    clinic_address?: string
    vehicle_type?: string
    license_plate?: string
    experience_years?: number
  }) => {
    const redirectUrl = `${window.location.origin}/dashboard`

    // Préparer les métadonnées utilisateur avec TOUS les champs
    const userMetadata = {
      name: userData.name,
      role: userData.role,
      phone: userData.phone || '',
      email: email
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userMetadata
      }
    })

    // Create role-specific profile if signup is successful
    if (data.user && !error) {
      try {
        // Create the specific role table entry
        switch (userData.role) {
          case 'patient':
            const patientData: any = {
              user_id: data.user.id
            }
            if (userData.insurance_id) patientData.insurance_id = userData.insurance_id
            if (userData.cmu_number) patientData.cmu_number = userData.cmu_number

            const { error: patientError } = await supabase.from('patients').insert(patientData)
            if (patientError) {
              console.error('Error creating patient profile:', patientError)
              throw patientError
            }
            break
          case 'pharmacy':
            const { error: pharmacyError } = await supabase.from('pharmacies').insert({
              user_id: data.user.id,
              name: userData.name,
              address: userData.clinic_address || '',
              license_number: userData.license_number
            })
            if (pharmacyError) throw pharmacyError
            break
          case 'driver':
            const { error: driverError } = await supabase.from('drivers').insert({
              user_id: data.user.id,
              vehicle_type: userData.vehicle_type,
              license_plate: userData.license_plate,
              experience_years: userData.experience_years
            })
            if (driverError) throw driverError
            break
          case 'doctor':
            const { error: doctorError } = await supabase.from('doctors').insert({
              user_id: data.user.id,
              license_number: userData.license_number || '',
              specialization: userData.specialization,
              clinic_name: userData.clinic_name,
              clinic_address: userData.clinic_address
            })
            if (doctorError) throw doctorError
            break
          case 'insurer':
            const { error: insurerError } = await supabase.from('insurers').insert({
              user_id: data.user.id,
              company_name: userData.company_name || '',
              license_number: userData.license_number || ''
            })
            if (insurerError) throw insurerError
            break
        }
      } catch (profileError: any) {
        console.error('Error creating role profile:', profileError)
        // Return the error so it can be displayed to the user
        return { data, error: { message: `Compte créé mais erreur lors de la configuration du profil: ${profileError.message}` } as any }
      }
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut
  }
}