import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Eye, EyeOff, Bike, Clock, MapPin, CreditCard, ArrowLeft, Truck, CheckCircle2, ShieldCheck, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
})

const signUpSchema = z.object({
  name: z.string().min(2, 'Le nom complet est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  phone: z.string().min(8, 'Numéro de téléphone requis'),
  cniNumber: z.string().min(8, 'Numéro CNI/Passeport requis'),
  vehicleType: z.string().min(2, 'Type de véhicule requis'),
  licensePlate: z.string().min(2, 'Immatriculation requise'),
  driverLicense: z.string().min(5, 'Numéro de permis requis'),
  experience: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

interface DriverAuthFormProps {
  onSuccess?: () => void
}

export const DriverAuthForm = ({ onSuccess }: DriverAuthFormProps) => {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      cniNumber: '',
      vehicleType: '',
      licensePlate: '',
      driverLicense: '',
      experience: ''
    }
  })

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    setLoading(true)
    try {
      const { error } = await signIn(values.email, values.password)
      if (error) throw error

      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue dans votre espace livreur!'
      })
      onSuccess?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast({
        title: 'Erreur de connexion',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const onSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setLoading(true)
    try {
      const userData = {
        name: values.name.trim(),
        role: 'driver',
        phone: values.phone.trim(),
        vehicle_type: values.vehicleType.trim(),
        license_plate: values.licensePlate.trim(),
        driver_license: values.driverLicense.trim(),
        experience_years: values.experience ? parseInt(values.experience) : undefined
      }

      const { error } = await signUp(values.email.trim(), values.password, userData)

      if (error) {
        console.error('Driver signup error:', error)
        if (error.message.includes('already registered')) {
          throw new Error('Cet email est déjà utilisé. Veuillez vous connecter.')
        }
        throw new Error(error.message || 'Erreur lors de la création du compte')
      }

      toast({
        title: '✅ Candidature envoyée',
        description: 'Votre dossier sera examiné sous 24h.'
      })

      signUpForm.reset()
      setIsSignUp(false)
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('Driver registration error:', error)
      toast({
        title: '❌ Erreur d\'inscription',
        description: errorMessage || 'Une erreur est survenue',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-amber-50/50">

      {/* Left Side - Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-amber-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/90 to-amber-900/90 mix-blend-multiply z-10" />
        <img
          src="/hero-carousel/delivery-v2.png"
          alt="Espace Livreur"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-20 opacity-30">
          <div className="absolute top-10 right-10 w-96 h-96 bg-orange-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-yellow-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-30 flex flex-col justify-between p-12 h-full w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
              <Truck className="h-5 w-5 text-amber-200" />
              <span className="text-sm font-bold tracking-wider uppercase">PharmaGo Delivery</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-tight mb-6">
              Livrez la Santé<br />
              <span className="text-amber-300 italic">Kilomètre après Kilomètre.</span>
            </h1>
            <p className="text-lg text-amber-100/80 max-w-md leading-relaxed">
              Rejoignez le premier réseau de livraison pharmaceutique sécurisé. Gagnez votre vie en sauvant des vies.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <ShieldCheck className="h-6 w-6 text-amber-300 mb-2" />
              <h3 className="font-bold text-lg">Sécurité</h3>
              <p className="text-xs text-amber-100/70">Protocoles Certifiés</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <Zap className="h-6 w-6 text-amber-300 mb-2" />
              <h3 className="font-bold text-lg">Revenus</h3>
              <p className="text-xs text-amber-100/70">Paiements Rapides</p>
            </div>
          </div>

          <p className="text-xs text-amber-200/60 uppercase tracking-widest font-bold mt-8">
            © 2024 PharmaGo Inc. • Logistics
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-8 duration-700">

          {/* Header */}
          <div className="text-center space-y-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile-selection')}
              className="absolute top-6 right-6 lg:top-12 lg:right-12 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>

            <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-amber-100/50 text-amber-600 mb-4 shadow-sm ring-1 ring-amber-100">
              <Bike className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              {isSignUp ? 'Devenir Partenaire' : 'Espace Livreur'}
            </h2>
            <p className="text-muted-foreground font-medium">
              {isSignUp
                ? 'Postulez pour rejoindre la flotte PharmaGo.'
                : 'Connectez-vous pour commencer vos courses.'}
            </p>
          </div>

          {/* Form */}
          {isSignUp ? (
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <FormField
                  control={signUpForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nom Complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom complet" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 transition-all font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="votre@email.com" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 transition-all font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signUpForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+225..." {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 transition-all font-medium" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signUpForm.control}
                    name="cniNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">N° CNI</FormLabel>
                        <FormControl>
                          <Input placeholder="CI2024..." {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 transition-all font-medium" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signUpForm.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Véhicule</FormLabel>
                        <FormControl>
                          <Input placeholder="Moto, Scooter..." {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 transition-all font-medium" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Immatriculation</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 XY 01" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 transition-all font-medium" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={signUpForm.control}
                  name="driverLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Permis de Conduire</FormLabel>
                      <FormControl>
                        <Input placeholder="A2024XXXXXXX" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 transition-all font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Mot de passe</FormLabel>
                        <div className="relative group">
                          <FormControl>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...field}
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 transition-all font-medium pr-10"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-amber-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirmer</FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                            className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 transition-all font-medium"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold tracking-wide shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.01]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                  Postuler maintenant
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-5">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</FormLabel>
                      <div className="relative group">
                        <FormControl>
                          <Input type="email" placeholder="votre@email.com" {...field} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium relative z-20" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between ml-1 mb-1.5">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mot de passe</FormLabel>
                        <button type="button" className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline transition-all">
                          Oublié ?
                        </button>
                      </div>
                      <div className="relative group">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium relative z-20 pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-muted-foreground hover:text-amber-600 z-30 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold tracking-wide shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Bike className="mr-2 h-5 w-5" />}
                  Commencer mes livraisons
                </Button>
              </form>
            </Form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-amber-50/50 px-2 text-muted-foreground font-bold tracking-widest">Ou</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              {isSignUp ? 'Vous avez déjà un compte ?' : 'Nouveau livreur ?'}
            </p>
            <button
              type="button"
              className="text-amber-600 hover:text-amber-700 font-black text-sm uppercase tracking-wider mt-1 hover:underline transition-all"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Se connecter' : 'Postuler'}
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 flex gap-4 text-xs text-muted-foreground/60 font-medium bg-slate-100/50 px-4 py-2 rounded-full">
          <a href="#" className="hover:text-foreground transition-colors">Charte Livreur</a>
          <span>•</span>
          <a href="#" className="hover:text-foreground transition-colors">Assurance</a>
        </div>
      </div>
    </div>
  )
}