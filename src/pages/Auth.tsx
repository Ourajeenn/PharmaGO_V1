import { AuthForm } from '@/components/auth/AuthForm'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function Auth() {
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
    return (
      <div className="flex items-center justify-center h-screen mesh-gradient">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-[480px] animate-in zoom-in-95 duration-700">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/40 rounded-2xl border border-white/40 shadow-xl mb-4">
            <span className="text-3xl font-black text-primary">P</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground/90 uppercase">
            Pharma<span className="text-primary tracking-normal">Go</span>
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Elite Health Logistics Excellence
          </p>
        </div>

        <div className="glass-card p-1 lg:p-1.5 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-white/40 backdrop-blur-xl p-8 lg:p-10 rounded-[2.2rem] border border-white/40">
            <AuthForm onSuccess={handleAuthSuccess} />
          </div>
        </div>

        <p className="text-center mt-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          Sécurité de Classe Militaire • Chiffrement de Bout en Bout
        </p>
      </div>
    </div>
  )
}