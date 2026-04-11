import { DoctorAuthForm } from '@/components/auth/DoctorAuthForm'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import Preloader from '@/components/core/Preloader'

export default function DoctorAuth() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleAuthSuccess = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return <Preloader />
  }

  return <DoctorAuthForm onSuccess={handleAuthSuccess} />
}
