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
import { Loader2, Eye, EyeOff, Shield, CreditCard, ArrowLeft, Zap, ShieldCheck, Lock, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { uploadProfileImage } from '@/utils/upload'

const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
})

const signUpSchema = z.object({
  companyName: z.string().min(2, 'Le nom de la compagnie est requis'),
  representativeName: z.string().min(2, 'Le nom du représentant est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  phone: z.string().min(8, 'Numéro de téléphone requis'),
  licenseNumber: z.string().min(5, 'Numéro de licence requis'),
  registrationNumber: z.string().min(5, 'Numéro d\'enregistrement requis'),
  insuranceType: z.string().min(2, 'Type d\'assurance requis'),
  address: z.string().min(10, 'Adresse complète requise')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

interface InsurerAuthFormProps {
  onSuccess?: () => void
}

export const InsurerAuthForm = ({ onSuccess }: InsurerAuthFormProps) => {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [insuranceProfileType, setInsuranceProfileType] = useState<'maladie' | 'cmu' | null>(null)
  const [logoImage, setLogoImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
      companyName: '',
      representativeName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      licenseNumber: '',
      registrationNumber: '',
      insuranceType: '',
      address: ''
    }
  })

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    setLoading(true)
    try {
      const { error } = await signIn(values.email, values.password)
      if (error) throw error

      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue dans votre espace assureur!'
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
      let avatarUrl = null
      if (logoImage) {
        avatarUrl = await uploadProfileImage(logoImage, 'avatars')
      }

      const userData = {
        name: values.companyName.trim(),
        role: 'insurer',
        phone: values.phone.trim(),
        license_number: values.licenseNumber.trim(),
        company_name: values.companyName.trim(),
        avatar_url: avatarUrl
      }

      const { error } = await signUp(values.email.trim(), values.password, userData)

      if (error) {
        console.error('Insurer signup error:', error)
        if (error.message.includes('already registered')) {
          throw new Error('Cet email est déjà utilisé. Veuillez vous connecter.')
        }
        throw new Error(error.message || 'Erreur lors de la création du compte')
      }

      toast({
        title: '✅ Demande envoyée',
        description: 'Votre dossier d\'accréditation sera examiné sous 72h.'
      })

      signUpForm.reset()
      setIsSignUp(false)
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('Insurer registration error:', error)
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
    <div className="min-h-screen w-full flex overflow-hidden bg-indigo-50/50">

      {/* Left Side - Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 mix-blend-multiply z-10" />
        <img
          src="/login-bg.png"
          alt="Espace Assureur"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-20 opacity-30">
          <div className="absolute top-20 left-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-30 flex flex-col justify-between p-12 h-full w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
              <ShieldCheck className="h-5 w-5 text-indigo-200" />
              <span className="text-sm font-bold tracking-wider uppercase">PharmaGo Insurance</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-tight mb-6">
              Sécurisez les<br />
              <span className="text-indigo-300 italic">Parcours de Soins.</span>
            </h1>
            <p className="text-lg text-indigo-100/80 max-w-md leading-relaxed">
              Plateforme de gestion unifiée pour les assurances et mutuelles. Simplifiez les remboursements et l'accès aux soins.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <Lock className="h-6 w-6 text-indigo-300 mb-2" />
              <h3 className="font-bold text-lg">Données</h3>
              <p className="text-xs text-indigo-100/70">Chiffrement de bout en bout</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <Zap className="h-6 w-6 text-indigo-300 mb-2" />
              <h3 className="font-bold text-lg">Temps Réel</h3>
              <p className="text-xs text-indigo-100/70">Traitement instantané</p>
            </div>
          </div>

          <p className="text-xs text-indigo-200/60 uppercase tracking-widest font-bold mt-8">
            © 2025 PharmaGo Inc. • Insurance Division
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 relative z-40 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-xl space-y-8 animate-in slide-in-from-right-8 duration-700">

          {/* Header */}
          <div className="text-center space-y-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile-selection')}
              className="absolute top-6 right-6 lg:top-12 lg:right-12 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>

            <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-indigo-100/50 text-indigo-600 mb-4 shadow-sm ring-1 ring-indigo-100">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              {isSignUp ? 'Partenariat Assureur' : 'Espace Assureur'}
            </h2>
            <p className="text-muted-foreground font-medium">
              {isSignUp
                ? 'Accréditez votre établissement pour rejoindre le réseau.'
                : 'Connectez-vous pour gérer vos assurés.'}
            </p>
          </div>

          {/* Form Content */}
          {isSignUp ? (
            insuranceProfileType === null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500 pt-4">
                <button
                  onClick={() => setInsuranceProfileType('maladie')}
                  className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all text-left group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Shield className="h-10 w-10 text-indigo-600 mb-4 transition-transform group-hover:scale-110 relative z-10" />
                  <h4 className="text-lg font-bold tracking-tight mb-2 relative z-10">Assurance Maladie</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed relative z-10">Compagnies classiques, mutuelles et prévoyances professionnelles.</p>
                </button>
                <button
                  onClick={() => setInsuranceProfileType('cmu')}
                  className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-green-500 hover:shadow-lg hover:shadow-green-500/10 transition-all text-left group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CreditCard className="h-10 w-10 text-green-600 mb-4 transition-transform group-hover:scale-110 relative z-10" />
                  <h4 className="text-lg font-bold tracking-tight mb-2 relative z-10">Fonds CMU</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed relative z-10">Couverture Maladie Universelle et programmes d'aide sociale.</p>
                </button>
              </div>
            ) : (
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setInsuranceProfileType(null)}
                    className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    ← Changer le type de profil
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={signUpForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Compagnie</FormLabel>
                          <FormControl>
                            <Input placeholder="NSIA Assurances Vie" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all font-medium" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="representativeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Représentant</FormLabel>
                          <FormControl>
                            <Input placeholder="M. Jean Kouassi" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all font-medium" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Insurer Logo Upload */}
                  <div className="space-y-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Logo de la Compagnie (Optionnel)</FormLabel>
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all overflow-hidden group"
                      >
                        {logoImage ? (
                          <img
                            src={URL.createObjectURL(logoImage)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Upload className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setLogoImage(e.target.files[0])
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {logoImage ? "Changer le logo" : "Ajouter un logo"}
                        </Button>
                        {logoImage && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 mt-1 h-6"
                            onClick={() => {
                              setLogoImage(null)
                              if (fileInputRef.current) fileInputRef.current.value = ''
                            }}
                          >
                            <X className="h-3 w-3 mr-1" /> Supprimer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Corporatif</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="partenariat@assurance.ci" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all font-medium" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={signUpForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Tel</FormLabel>
                          <FormControl>
                            <Input placeholder="+225..." {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all font-medium" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">CIMA</FormLabel>
                          <FormControl>
                            <Input placeholder="CIMA..." {...field} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all font-medium" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="insuranceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all font-medium">
                                <SelectValue placeholder="Cat." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sante">Santé</SelectItem>
                              <SelectItem value="cmu">CMU</SelectItem>
                              <SelectItem value="mixte">Mixte</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

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
                                autoComplete="new-password"
                                {...field}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all font-medium pr-10"
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-indigo-600 transition-colors"
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
                          <div className="relative group">
                            <FormControl>
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                {...field}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all font-medium"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wide shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01]" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                    Accréditer la Compagnie
                  </Button>
                </form>
              </Form>
            )
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
                          <Input type="email" placeholder="partenariat@assurance.ci" {...field} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium relative z-20" />
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
                        <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
                          Oublié ?
                        </button>
                      </div>
                      <div className="relative group">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium relative z-20 pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-muted-foreground hover:text-indigo-600 z-30 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wide shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.01]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                  Valider l'Accès
                </Button>
              </form>
            </Form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-indigo-50/50 px-2 text-muted-foreground font-bold tracking-widest">Ou</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              {isSignUp ? 'Vous avez déjà un compte ?' : 'Compagnie non inscrite ?'}
            </p>
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-700 font-black text-sm uppercase tracking-wider mt-1 hover:underline transition-all"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Se connecter' : 'S\'enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}