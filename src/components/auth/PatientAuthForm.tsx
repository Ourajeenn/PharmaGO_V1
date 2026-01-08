import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Eye, EyeOff, User, Heart, Shield, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PatientAuthFormProps {
  onSuccess?: () => void
}

export const PatientAuthForm = ({ onSuccess }: PatientAuthFormProps) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Sign Up State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [insuranceNumber, setInsuranceNumber] = useState('')
  const [cmuNumber, setCmuNumber] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!signInEmail || !signInPassword) {
        throw new Error('Veuillez remplir tous les champs')
      }

      const { error } = await signIn(signInEmail, signInPassword)
      if (error) {
        if (error.message.includes('Invalid login')) {
          throw new Error('Email ou mot de passe incorrect')
        }
        throw error
      }

      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue dans votre espace patient!'
      })
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Impossible de se connecter',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (!name || !email || !password || !phone) {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }

      if (password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères')
      }

      if (password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Email invalide')
      }

      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: 'patient' as const,
        insurance_id: insuranceNumber.trim() || undefined,
        cmu_number: cmuNumber.trim() || undefined,
      }

      const { error } = await signUp(email.trim().toLowerCase(), password, userData)

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          throw new Error('Cet email est déjà utilisé. Veuillez vous connecter.')
        }
        if (error.message.includes('Password should be')) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères.')
        }

        throw new Error(error.message || 'Erreur lors de la création du compte')
      }

      toast({
        title: '✅ Inscription réussie !',
        description: 'Votre compte patient a été créé. Vérifiez votre email pour confirmer votre inscription.'
      })

      // Reset form
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setPhone('')
      setInsuranceNumber('')
      setCmuNumber('')
      setIsSignUp(false)
    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        title: '❌ Erreur d\'inscription',
        description: error.message || 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6 flex items-center gap-2 hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Section informative */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-primary mb-4">
                Espace Patient
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Commandez vos médicaments en toute sécurité
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Ordonnances</h3>
                <p className="text-xs text-muted-foreground">Uploadez vos prescriptions</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Assurance</h3>
                <p className="text-xs text-muted-foreground">Prise en charge CMU</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <User className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Profil</h3>
                <p className="text-xs text-muted-foreground">Historique sécurisé</p>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Avantages Patient</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-green-500"></Badge>
                  Livraison rapide à domicile
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-blue-500"></Badge>
                  Suivi en temps réel
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-purple-500"></Badge>
                  Rappels de renouvellement
                </li>
              </ul>
            </div>
          </div>

          {/* Formulaire */}
          <Card className="w-full relative z-10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <User className="h-6 w-6 text-primary" />
                {isSignUp ? 'Créer mon compte patient' : 'Connexion Patient'}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp
                  ? 'Rejoignez PharmaGo pour commander vos médicaments avec votre CMU'
                  : 'Accédez à votre espace personnel et à vos commandes'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSignUp ? (
                <form onSubmit={handleSignUp} className="space-y-4" autoComplete="off">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      name="fullname"
                      type="text"
                      placeholder="Votre nom complet"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      name="telephone"
                      type="tel"
                      placeholder="+225 XX XX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insurance">N° Assurance (optionnel)</Label>
                      <Input
                        id="insurance"
                        name="insurance-number"
                        type="text"
                        placeholder="XXXXXXXXXXXXX"
                        value={insuranceNumber}
                        onChange={(e) => setInsuranceNumber(e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cmu">N° CMU (optionnel)</Label>
                      <Input
                        id="cmu"
                        name="cmu-number"
                        type="text"
                        placeholder="XXXXXXXXXXXXX"
                        value={cmuNumber}
                        onChange={(e) => setCmuNumber(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription en cours...
                      </>
                    ) : (
                      "S'inscrire"
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Déjà un compte ? </span>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-primary hover:underline font-medium"
                    >
                      Se connecter
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4" autoComplete="on">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="username"
                      type="email"
                      placeholder="votre@email.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="current-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Pas encore de compte ? </span>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-primary hover:underline font-medium"
                    >
                      S'inscrire
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}