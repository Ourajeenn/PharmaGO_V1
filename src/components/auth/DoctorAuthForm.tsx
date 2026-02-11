import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Eye, EyeOff, Stethoscope, FileText, Users, Award, ArrowLeft, Zap, HeartPulse, CheckCircle2 } from 'lucide-react'
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
  specialty: z.string().min(2, 'Spécialité requise'),
  medicalLicense: z.string().min(5, 'Numéro d\'ordre requis'),
  hospital: z.string().optional(),
  clinicAddress: z.string().optional(),
  experience: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

interface DoctorAuthFormProps {
  onSuccess?: () => void
}

export const DoctorAuthForm = ({ onSuccess }: DoctorAuthFormProps) => {
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
      specialty: '',
      medicalLicense: '',
      hospital: '',
      clinicAddress: '',
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
        description: 'Bienvenue Docteur, accédez à vos e-ordonnances!'
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
        role: 'doctor',
        phone: values.phone.trim(),
        license_number: values.medicalLicense.trim(),
        specialization: values.specialty.trim(),
        clinic_name: values.hospital?.trim() || undefined,
        clinic_address: values.clinicAddress?.trim() || undefined,
        experience_years: values.experience ? parseInt(values.experience) : undefined
      }

      const { error } = await signUp(values.email.trim(), values.password, userData)

      if (error) {
        console.error('Doctor signup error:', error)
        if (error.message.includes('already registered')) {
          throw new Error('Cet email est déjà utilisé. Veuillez vous connecter.')
        }
        throw new Error(error.message || 'Erreur lors de la création du compte')
      }

      toast({
        title: '✅ Demande envoyée',
        description: 'Votre dossier médical sera vérifié sous 48h.'
      })

      signUpForm.reset()
      setIsSignUp(false)
    } catch (error: any) {
      console.error('Doctor registration error:', error)
      toast({
        title: '❌ Erreur d\'inscription',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-blue-50/50">

      {/* Left Side - Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-900/90 mix-blend-multiply z-10" />
        <img
          src="/hero-carousel/consultation.png"
          alt="Espace Médecin"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-20 opacity-30">
          <div className="absolute top-20 left-20 w-80 h-80 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-30 flex flex-col justify-between p-12 h-full w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
              <Stethoscope className="h-5 w-5 text-blue-200" />
              <span className="text-sm font-bold tracking-wider uppercase">Espace Praticien</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-tight mb-6">
              Prescrivez en toute<br />
              <span className="text-blue-300 italic">Simplicité.</span>
            </h1>
            <p className="text-lg text-blue-100/80 max-w-md leading-relaxed">
              Digitalisez vos ordonnances, suivez l'observance de vos patients et collaborez avec un réseau de pharmaciens certifiés.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <FileText className="h-6 w-6 text-blue-300 mb-2" />
              <h3 className="font-bold text-lg">E-Ordonnances</h3>
              <p className="text-xs text-blue-100/70">Sécurisées & Instantanées</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <Users className="h-6 w-6 text-blue-300 mb-2" />
              <h3 className="font-bold text-lg">Suivi Patient</h3>
              <p className="text-xs text-blue-100/70">Dossier médical partagé</p>
            </div>
          </div>

          <p className="text-xs text-blue-200/60 uppercase tracking-widest font-bold mt-8">
            © 2024 PharmaGo Inc. • Medical Board
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 relative z-40 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
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

            <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-blue-100/50 text-blue-600 mb-4 shadow-sm ring-1 ring-blue-100">
              <Stethoscope className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              {isSignUp ? 'Rejoindre le Corps Médical' : 'Espace Médecin'}
            </h2>
            <p className="text-muted-foreground font-medium">
              {isSignUp
                ? 'Créez votre compte praticien certifié.'
                : 'Accédez à votre portail de tele-medecine.'}
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
                        <Input placeholder="Dr. Jean Kouassi" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all font-medium" />
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Pro</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="dr.kouassi@hopital.ci" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all font-medium" />
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
                          <Input placeholder="+225..." {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all font-medium" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signUpForm.control}
                    name="medicalLicense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">N° Ordre</FormLabel>
                        <FormControl>
                          <Input placeholder="OM2024XXXX" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all font-medium" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={signUpForm.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Spécialité</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all font-medium">
                            <SelectValue placeholder="Sélectionnez..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="generaliste">Médecine Générale</SelectItem>
                          <SelectItem value="cardiologie">Cardiologie</SelectItem>
                          <SelectItem value="pediatrie">Pédiatrie</SelectItem>
                          <SelectItem value="gynecologie">Gynécologie</SelectItem>
                          <SelectItem value="dermatologie">Dermatologie</SelectItem>
                          <SelectItem value="psychiatrie">Psychiatrie</SelectItem>
                          <SelectItem value="autre">Autre spécialité</SelectItem>
                        </SelectContent>
                      </Select>
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
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all font-medium pr-10"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-blue-600 transition-colors"
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
                            className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all font-medium"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                  Envoyer Ma Candidature
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Pro</FormLabel>
                      <div className="relative group">
                        <FormControl>
                          <Input type="email" placeholder="dr.kouassi@hopital.ci" {...field} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium relative z-20" />
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
                        <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                          Oublié ?
                        </button>
                      </div>
                      <div className="relative group">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium relative z-20 pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-muted-foreground hover:text-blue-600 z-30 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                  Démarrer La Session
                </Button>
              </form>
            </Form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-blue-50/50 px-2 text-muted-foreground font-bold tracking-widest">Ou</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              {isSignUp ? 'Vous avez déjà un compte ?' : 'Nouveau praticien ?'}
            </p>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-black text-sm uppercase tracking-wider mt-1 hover:underline transition-all"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Se connecter' : 'S\'inscrire'}
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 flex gap-4 text-xs text-muted-foreground/60 font-medium bg-slate-100/50 px-4 py-2 rounded-full">
          <a href="#" className="hover:text-foreground transition-colors">Ordre des Médecins</a>
          <span>•</span>
          <a href="#" className="hover:text-foreground transition-colors">Support Med</a>
        </div>
      </div>
    </div>
  )
}