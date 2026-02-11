import { PatientAuthForm } from '@/components/auth/PatientAuthForm'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import Preloader from '@/components/Preloader'

export default function PatientAuth() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user) {
      if (user.role === 'patient') {
        navigate('/dashboard')
      } else {
        // Redirect if logged in but not a patient (optional safety)
        navigate('/dashboard')
      }
    }
  }, [user, navigate])

  const handleAuthSuccess = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return <Preloader />
  }

  return <PatientAuthForm onSuccess={handleAuthSuccess} />
}