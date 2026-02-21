import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Lock, Mail, ArrowLeft, LogIn, Fingerprint } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import { BiometricService } from '@/services/BiometricService'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
})

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBiometricLogin = async () => {
    setBiometricLoading(true)
    setError('')
    try {
      const success = await BiometricService.authenticate()
      if (success) {
        toast({
          title: 'Authentification réussie',
          description: 'Déverrouillage biométrique activé'
        })
        // En mode démo, on redirige vers le dashboard
        // En production, le Passkey contient l'id utilisateur
        navigate('/dashboard')
      } else {
        setError('Échec de la vérification biométrique')
      }
    } catch (err) {
      setError('Erreur biométrique')
    } finally {
      setBiometricLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      loginSchema.parse({ email, password })
      const { data, error: signInError } = await signIn(email, password)

      if (signInError) {
        setError('Email ou mot de passe incorrect')
        setLoading(false)
        return
      }

      if (data.user) {
        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue sur PharmaGo'
        })
        navigate('/dashboard')
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
      } else {
        setError('Une erreur est survenue lors de la connexion')
      }
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-800 to-orange-800 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Top wave - Blue variations from top */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-600/40 via-blue-500/30 to-transparent animate-wave-from-top" />

      {/* Bottom wave - Strong Orange from bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-600/50 via-orange-500/35 to-transparent animate-wave-from-bottom" />

      {/* Middle wave - Accent cyan flowing */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-400/10 to-transparent animate-wave-middle" />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes wave-from-top {
          0%, 100% {
            transform: translateY(0) scaleY(1);
            border-radius: 0 0 60% 40%;
          }
          25% {
            transform: translateY(3%) scaleY(1.1);
            border-radius: 0 0 50% 50%;
          }
          50% {
            transform: translateY(5%) scaleY(1.15);
            border-radius: 0 0 40% 60%;
          }
          75% {
            transform: translateY(3%) scaleY(1.1);
            border-radius: 0 0 55% 45%;
          }
        }
        
        @keyframes wave-from-bottom {
          0%, 100% {
            transform: translateY(0) scaleY(1);
            border-radius: 40% 60% 0 0;
          }
          25% {
            transform: translateY(-3%) scaleY(1.1);
            border-radius: 50% 50% 0 0;
          }
          50% {
            transform: translateY(-5%) scaleY(1.15);
            border-radius: 60% 40% 0 0;
          }
          75% {
            transform: translateY(-3%) scaleY(1.1);
            border-radius: 45% 55% 0 0;
          }
        }
        
        @keyframes wave-middle {
          0%, 100% {
            transform: translateX(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateX(10%) scale(1.1);
            opacity: 0.5;
          }
        }
        
        .animate-wave-from-top {
          animation: wave-from-top 10s ease-in-out infinite;
        }
        
        .animate-wave-from-bottom {
          animation: wave-from-bottom 12s ease-in-out infinite;
        }
        
        .animate-wave-middle {
          animation: wave-middle 8s ease-in-out infinite;
        }
        
        @keyframes glassmorphism {
          0%, 100% {
            box-shadow: 
              0 8px 32px rgba(59, 130, 246, 0.3),
              0 0 80px rgba(59, 130, 246, 0.15),
              inset 0 0 60px rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 
              0 8px 32px rgba(249, 115, 22, 0.4),
              0 0 100px rgba(249, 115, 22, 0.2),
              inset 0 0 80px rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 200, 100, 0.4);
          }
        }
        
        .animate-glassmorphism {
          animation: glassmorphism 6s ease-in-out infinite;
        }
      `}} />


      {/* Back button - absolute positioned */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-white/80 hover:text-white hover:bg-white/10 z-10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      {/* Main card container */}
      <div className="relative w-full max-w-5xl">
        <div className="grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-2 border-white/30 animate-glassmorphism">

          {/* Left side - Image with gradient */}
          <div className="hidden lg:block relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/40 via-pink-500/40 to-cyan-500/40" />
            <img
              src="/pharmacy-login.jpg"
              alt="Pharmacienne PharmaGo"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-white/90 text-sm">Connexion sécurisée avec authentification basée sur les rôles</p>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="p-8 lg:p-12 bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-orange-900/90 backdrop-blur-xl relative">
            {/* PharmaGo branding */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">PharmaGo</h3>
                <p className="text-white/50 text-xs">v1.0</p>
              </div>
            </div>

            {/* Welcome text */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Bienvenue
              </h1>
              <p className="text-white/60">
                Connectez-vous pour continuer votre expérience santé.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium">
                  Email ou nom d'utilisateur
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    type="email"
                    placeholder="votre@domaine.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-primary/50 rounded-xl transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm font-medium">
                    Mot de passe
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-primary hover:text-primary/80 text-sm transition-colors"
                  >
                    Oublié?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-primary/50 rounded-xl transition-all"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me & Need help */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-white/70 cursor-pointer select-none"
                  >
                    Se souvenir de moi
                  </label>
                </div>
                <Link
                  to="/contact"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Besoin d'aide?
                </Link>
              </div>

              {/* Sign in button */}
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={loading || biometricLoading}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-orange-500/50"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>

                {BiometricService.isSupported() && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading || biometricLoading}
                    onClick={handleBiometricLogin}
                    className="w-full h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <Fingerprint className="mr-2 h-5 w-5 text-cyan-400" />
                    {biometricLoading ? 'Vérification...' : 'Déverrouillage Biométrique'}
                  </Button>
                )}
              </div>

              {/* Sign up link */}
              <div className="text-center pt-4">
                <span className="text-white/60 text-sm">
                  Nouveau sur PharmaGo?{' '}
                </span>
                <Link
                  to="/profile-selection"
                  className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                >
                  Créer un compte
                </Link>
              </div>
            </form>

            {/* Bottom decorative element */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </div>
  )
}
