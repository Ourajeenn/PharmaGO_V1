import { PharmacyAuthForm } from '@/components/auth/PharmacyAuthForm'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import Preloader from '@/components/Preloader'

export default function PharmacyAuth() {
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

  return <PharmacyAuthForm onSuccess={handleAuthSuccess} />
}