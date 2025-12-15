import { AuthForm } from '@/components/auth/AuthForm'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import Preloader from '@/components/Preloader'

export default function Auth() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleAuthSuccess = () => {
    navigate('/')
  }

  if (loading) {
    return <Preloader />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">PharmaGo</h1>
          <p className="text-muted-foreground">
            Votre pharmacie à portée de main
          </p>
        </div>
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    </div>
  )
}