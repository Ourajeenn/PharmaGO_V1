import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Truck, User, Mail, Phone, Lock, FileText, Bike, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function DriverAuth() {
  const navigate = useNavigate()
  const { signUp, signIn } = useAuth()
  const { toast } = useToast()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  // Sign Up State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [driverLicense, setDriverLicense] = useState('')

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userData = {
        name: name,
        role: 'driver',
        phone: phone,
        vehicle_type: vehicleType,
        license_plate: driverLicense
      }

      const { error } = await signUp(email, password, userData)

      if (error) throw error

      toast({
        title: 'Candidature envoyée !',
        description: 'Votre profil sera examiné sous 24h.',
      })
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (error: any) {
      toast({
        title: 'Erreur lors de l\'inscription',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(loginEmail, loginPassword)
      if (error) throw error

      toast({
        title: 'Connexion réussie !',
        description: 'Bonne route avec PharmaGo !',
      })
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-6 relative overflow-hidden bg-slate-50">
      <div className="w-full max-w-lg relative z-10 animate-in zoom-in-95 duration-700">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile-selection')}
          className="mb-8 flex items-center gap-2 hover:bg-white/40 transition-all rounded-xl px-4 font-bold border border-transparent hover:border-white/40 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest">Retour au sélecteur</span>
        </Button>

        <div className="glass-card p-1 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-white/40 backdrop-blur-xl p-8 lg:p-10 rounded-[2.2rem] border border-white/40">
            <div className="space-y-2 text-center mb-10">
              <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 border border-orange-500/20">
                <Truck className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-[0.9]">
                Espace <span className="text-orange-600 tracking-normal italic">Livreur</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {isSignUp ? 'Rejoignez la flotte Route Master' : 'Authentification logistique'}
              </p>
            </div>

            {isSignUp ? (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Jean Kouassi"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="nom@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+225 07..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type Véhicule</Label>
                    <div className="relative">
                      <Bike className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Moto 125cc"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">N° Permis</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="A-123456"
                        value={driverLicense}
                        onChange={(e) => setDriverLicense(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.01]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                  Postuler à la Flotte
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="nom@exemple.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mot de passe</Label>
                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:underline transition-all" onClick={() => navigate('/forgot-password')}>
                      Oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.01]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                  Démarrer le Service
                </Button>
              </form>
            )}

            <div className="mt-8 text-center pt-6 border-t border-white/20">
              <button
                type="button"
                className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-orange-600 transition-colors"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Déjà livreur ? Se connecter' : 'Nouveau ? Rejoindre la flotte'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}