import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { PatientDashboard } from '@/components/dashboard/PatientDashboard'
import { PharmacyDashboard } from '@/components/dashboard/PharmacyDashboard'
import { DriverDashboard } from '@/components/dashboard/DriverDashboard'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard'
import { InsurerDashboard } from '@/components/dashboard/InsurerDashboard'
import Preloader from '@/components/Preloader'
import { ProfileCompletion } from '@/components/auth/ProfileCompletion'
import { useState } from 'react'

export default function Dashboard() {
  const { user, profile, loading } = useAuth()
  const [profileCompleted, setProfileCompleted] = useState(false)

  if (loading) {
    return (
      <Preloader />
    )
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />
  }

  if (!profileCompleted) {
    return <ProfileCompletion onComplete={() => setProfileCompleted(true)} />
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case 'patient':
        return <PatientDashboard />
      case 'pharmacy':
        return <PharmacyDashboard />
      case 'driver':
        return <DriverDashboard />
      case 'admin':
        return <AdminDashboard />
      case 'doctor':
        return <DoctorDashboard />
      case 'insurer':
        return <InsurerDashboard />
      default:
        return <PatientDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {renderDashboard()}
    </div>
  )
}