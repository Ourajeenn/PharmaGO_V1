import { useState, useEffect, useCallback, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)

  // Track if we are already fetching to avoid redundant calls
  const isFetchingRef = useRef(false)

  const fetchProfile = useCallback(async (userId: string, authUser?: User | null) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true
      setLoading(true)
      setLastError(null)

      // 1. Récupérer le profil utilisateur depuis public.user_profiles
      let { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        console.error('Error in user_profiles query:', profileError)
        throw profileError
      }

      // 2. Gestion si le profil n'existe pas encore (ex: lag du trigger)
      if (!profileData && authUser) {
        const metadata = authUser.user_metadata
        console.warn(`Profil non trouvé immédiatement pour ${userId}. Rôle attendu: ${metadata?.role}.`)

        // On attend un court instant et on réessaye une fois (retry logic simple)
        await new Promise(resolve => setTimeout(resolve, 1500))

        const { data: retryData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (retryData) {
          profileData = retryData
        } else {
          // Soft repair si meta présent
          if (metadata?.role) {
            console.log("Tentative de synchronisation manuelle du profil...")
            const { data: syncedProfile } = await supabase
              .from('user_profiles')
              .upsert({
                id: userId,
                name: metadata.name || 'Utilisateur',
                role: metadata.role as any,
                email: authUser.email || '',
                phone: metadata.phone || '',
                verified: false
              })
              .select()
              .single()

            if (syncedProfile) profileData = syncedProfile
          }
        }
      }

      if (!profileData) {
        console.error('Profil introuvable pour', userId)
        setProfile(null)
        return
      }

      // 3. Vérifier le rôle effectif
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      const finalProfile: UserProfile = {
        ...profileData,
        role: (roleData?.role || profileData.role) as any
      }

      setProfile(finalProfile)
      console.log('Profil actif chargé:', finalProfile.role)
    } catch (error: any) {
      console.error('Auth Profile Error:', error)
      setLastError(error.message || 'Erreur lors du chargement du profil')
      setProfile(null)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, []) // Empty dependencies = stable function

  useEffect(() => {
    // Session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) fetchProfile(currentUser.id, currentUser)
      else setLoading(false)
    })

    // Écoute des changements d'état
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null
      setSession(session)

      // Update user state ONLY if it actually changed (prevents loop)
      setUser(prev => {
        if (prev?.id === currentUser?.id) return prev
        return currentUser
      })

      if (currentUser) {
        fetchProfile(currentUser.id, currentUser)
      } else {
        setProfile(null)
        if (event === 'SIGNED_OUT') {
          setLoading(false)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile]) // fetchProfile is now stable, so this effect runs only once

  const signUp = useCallback(async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          ...userData,
          email
        }
      }
    })
    return { data, error }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    const res = await supabase.auth.signOut()
    setProfile(null)
    setUser(null)
    setLoading(false)
    return res
  }, [])

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    fetchProfile,
    lastError
  }
}