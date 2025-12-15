import { DriverAuthForm } from '@/components/auth/DriverAuthForm'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import Preloader from '@/components/Preloader'

export default function DriverAuth() {
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

  return <DriverAuthForm onSuccess={handleAuthSuccess} />
}