import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { TwoFactorAuth } from './TwoFactorAuth'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  ArrowLeft,
  Smartphone
} from 'lucide-react'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
})

export const LoginForm = () => {
  const [step, setStep] = useState<'login' | '2fa' | 'setup-2fa' | 'forgot-password'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFACode, setTwoFACode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tempUserId, setTempUserId] = useState('')
  const { signIn } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation des données
      const validatedData = loginSchema.parse({ email, password })

      const { data, error } = await signIn(validatedData.email, validatedData.password)

      if (error) {
        throw new Error(error.message)
      }

      if (data?.user) {
        setTempUserId(data.user.id)

        // Simuler la vérification si l'utilisateur a activé 2FA
        const has2FA = Math.random() > 0.7 // 30% chance d'avoir 2FA activé

        if (has2FA) {
          setStep('2fa')
          toast({
            title: "Vérification requise",
            description: "Entrez votre code d'authentification à deux facteurs",
          })
        } else {
          // Proposer l'activation du 2FA pour les nouveaux utilisateurs
          const isNewUser = Math.random() > 0.5
          if (isNewUser) {
            setStep('setup-2fa')
          } else {
            navigate('/dashboard')
          }
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || 'Données invalides')
      } else {
        setError(err instanceof Error ? err.message : 'Erreur de connexion')
      }
    } finally {
      setLoading(false)
    }
  }

  const verify2FA = async () => {
    setLoading(true)
    try {
      // Simulation de vérification 2FA
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (twoFACode.length === 6) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        })
        navigate('/dashboard')
      } else {
        throw new Error('Code invalide')
      }
    } catch (error) {
      setError('Code de vérification invalide')
    } finally {
      setLoading(false)
    }
  }

  const skip2FASetup = () => {
    navigate('/dashboard')
  }

  const complete2FASetup = () => {
    toast({
      title: "2FA configuré",
      description: "Votre compte est maintenant plus sécurisé",
    })
    navigate('/dashboard')
  }

  if (step === 'forgot-password') {
    return <ForgotPasswordForm onBack={() => setStep('login')} />
  }

  if (step === 'setup-2fa') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Sécurisez votre compte</h1>
            <p className="text-muted-foreground">
              Activez l'authentification à deux facteurs pour une sécurité renforcée
            </p>
          </div>

          <TwoFactorAuth
            userId={tempUserId}
            onComplete={complete2FASetup}
            onBack={skip2FASetup}
          />

          <div className="text-center">
            <Button variant="link" onClick={skip2FASetup}>
              Ignorer pour le moment
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === '2fa') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setStep('login')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Vérification 2FA
                </CardTitle>
                <CardDescription>
                  Entrez votre code d'authentification à 6 chiffres
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Code de vérification</Label>
              <InputOTP
                maxLength={6}
                value={twoFACode}
                onChange={setTwoFACode}
                className="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Consultez votre application d'authentification ou vos SMS
              </AlertDescription>
            </Alert>

            <Button
              className="w-full"
              onClick={verify2FA}
              disabled={loading || twoFACode.length !== 6}
            >
              {loading ? 'Vérification...' : 'Vérifier et se connecter'}
            </Button>

            <div className="text-center">
              <Button variant="link" className="text-sm">
                Utiliser un code de secours
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="absolute left-4 top-4 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Accueil
          </Button>
          <CardTitle className="text-2xl font-bold mt-4">Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte PharmaGo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="link"
                className="px-0 text-sm"
                onClick={() => setStep('forgot-password')}
                type="button"
              >
                Mot de passe oublié ?
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Pas encore de compte ?{' '}
                <Button variant="link" className="px-0" onClick={() => navigate('/profile-selection')}>
                  S'inscrire
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}