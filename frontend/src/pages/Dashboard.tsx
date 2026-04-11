import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'
import { Navigate } from 'react-router-dom'
import { PatientDashboard } from '@/components/dashboard/PatientDashboard'
import { PharmacyDashboardNew } from '@/components/dashboard/PharmacyDashboardNew'
import { DriverDashboard } from '@/components/dashboard/DriverDashboard'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { DoctorDashboardNew } from '@/components/dashboard/DoctorDashboardNew'
import { InsurerDashboard } from '@/components/dashboard/InsurerDashboard'
import { ProfileCompletion } from '@/components/auth/ProfileCompletion'
import { useState, useEffect, useMemo } from 'react'
import { Loader2, AlertTriangle, RefreshCw, LogOut, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { user, profile, loading, fetchProfile, lastError } = useAuth()
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [hasRetried, setHasRetried] = useState(false)

  // Determine technical states
  const isInternalLoading = loading || (isRetrying && !profile)
  const isRoleExempt = profile?.role === 'admin'
  const shouldShowCompletion = profile && !isRoleExempt && !profileCompleted

  // Auto-retry once if profile is missing after initial load
  useEffect(() => {
    const autoRetry = async () => {
      if (!loading && user && !profile && !isRetrying && !hasRetried) {
        logger.log('Dashboard: profile missing on mount, attempting auto-retry...')
        setIsRetrying(true)
        setHasRetried(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        await fetchProfile(user.id, user)
        setIsRetrying(false)
      }
    }
    autoRetry()
  }, [loading, user, profile, fetchProfile, isRetrying, hasRetried])

  const handleRetry = async () => {
    if (user) {
      setIsRetrying(true)
      await fetchProfile(user.id, user)
      setIsRetrying(false)
    }
  }

  const renderDashboard = () => {
    if (!profile) return null
    switch (profile.role) {
      case 'patient': return <PatientDashboard />
      case 'pharmacy': return <PharmacyDashboardNew />
      case 'driver': return <DriverDashboard />
      case 'admin': return <AdminDashboard />
      case 'doctor': return <DoctorDashboardNew />
      case 'insurer': return <InsurerDashboard />
      default: return <PatientDashboard />
    }
  }

  // 1. Initial Loading State
  if (isInternalLoading) {
    return (
      <div className="flex items-center justify-center h-screen mesh-gradient">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Initialisation du Système...</p>
        </div>
      </div>
    )
  }

  // 2. No User (Redirect)
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // 3. Profile Still Missing after retries
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen mesh-gradient p-6">
        <div className="glass-card max-w-lg w-full p-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground/90">
              Profil <span className="text-red-600">Introuvable</span>
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              Le compte existe mais l'identité role-specific n'a pas pu être synchronisée.
            </p>
          </div>

          <div className="glass-card bg-red-500/5 border-red-500/20 p-4 text-left font-mono text-[10px] space-y-1.5 overflow-hidden">
            <p className="text-red-700/60 font-black uppercase tracking-tighter mb-2">Diagnostic Shell v1.0.5</p>
            <p>UUID: <span className="text-foreground">{user.id}</span></p>
            <p>ROLE_META: <span className="text-foreground">{user.user_metadata?.role || 'UNDEF'}</span></p>
            {lastError && (
              <div className="pt-2 border-t border-red-500/20 mt-2">
                <p className="text-red-700 font-bold">SQL_ERR: {lastError}</p>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="h-12 rounded-xl bg-foreground text-background font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02]"
            >
              {isRetrying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Tenter Récupération
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/profile-selection'}
              className="h-12 rounded-xl glass-morphism border-white/40 font-black uppercase tracking-widest"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Manuel Fix (Sélecteur)
            </Button>

            <Button
              variant="ghost"
              onClick={() => supabase.auth.signOut().then(() => window.location.href = '/auth')}
              className="h-10 text-muted-foreground font-bold hover:text-red-600 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion Système
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 4. Main Render Path (Completion or Dashboard)
  return (
    <div className="min-h-screen mesh-gradient">
      {shouldShowCompletion ? (
        <ProfileCompletion onComplete={() => setProfileCompleted(true)} />
      ) : (
        renderDashboard()
      )}
    </div>
  )
}