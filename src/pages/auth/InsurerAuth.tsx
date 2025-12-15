import { InsurerAuthForm } from '@/components/auth/InsurerAuthForm'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import Preloader from '@/components/Preloader'

export default function InsurerAuth() {
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

  return <InsurerAuthForm onSuccess={handleAuthSuccess} />
}