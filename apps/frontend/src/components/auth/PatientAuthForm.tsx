import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, User, Mail, Phone, Lock, HeartPulse, Zap, Eye, EyeOff, Fingerprint, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { uploadProfileImage } from '@/utils/upload'

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
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

interface PatientAuthFormProps {
  onSuccess?: () => void
}

export const PatientAuthForm = ({ onSuccess }: PatientAuthFormProps) => {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    }
  })

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    setLoading(true)
    try {
      const { error } = await signIn(values.email, values.password)
      if (error) throw error

      toast({
        title: 'Connexion réussie !',
        description: 'Bienvenue sur votre espace patient.',
      })
      onSuccess?.()
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

  const onSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setLoading(true)
    try {
      let avatarUrl = null
      if (profileImage) {
        avatarUrl = await uploadProfileImage(profileImage, 'avatars')
      }

      const { error } = await signUp(values.email, values.password, {
        name: values.name,
        phone: values.phone,
        role: 'patient',
        avatar_url: avatarUrl
      })

      if (error) throw error

      toast({
        title: 'Inscription réussie !',
        description: 'Veuillez vérifier votre email pour confirmer votre compte.',
      })
      // Delay to let toast show
      setTimeout(() => onSuccess?.(), 1000)

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

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-slate-50">

      {/* Left Side - Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-900/90 mix-blend-multiply z-10" />
        <img
          src="/pharmacy-login.jpg"
          alt="Santé Patient"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-20 opacity-30">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute top-1/2 right-10 w-64 h-64 bg-cyan-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-purple-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-30 flex flex-col justify-between p-12 h-full w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
              <HeartPulse className="h-5 w-5 text-blue-200" />
              <span className="text-sm font-bold tracking-wider uppercase">Espace Santé</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-tight mb-6">
              Votre Santé,<br />
              Notre <span className="text-blue-300 italic">Priorité.</span>
            </h1>
            <p className="text-lg text-blue-100/80 max-w-md leading-relaxed">
              Accédez à vos ordonnances, suivez vos commandes et gérez votre dossier médical en toute simplicité.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex-1">
                <h3 className="font-bold text-2xl mb-1">24/7</h3>
                <p className="text-xs text-blue-200 uppercase tracking-wider">Support Client</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex-1">
                <h3 className="font-bold text-2xl mb-1">100%</h3>
                <p className="text-xs text-blue-200 uppercase tracking-wider">Sécurisé</p>
              </div>
            </div>
            <p className="text-xs text-blue-200/60 uppercase tracking-widest font-bold">
              © 2024 PharmaGo Inc. • Elite Health Logistics
            </p>
          </div>
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

            <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-sm">
              <User className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              {isSignUp ? 'Créer un Compte' : 'Bon retour parmi nous'}
            </h2>
            <p className="text-muted-foreground font-medium">
              {isSignUp
                ? 'Rejoignez la communauté PharmaGo dès aujourd\'hui.'
                : 'Entrez vos identifiants pour accéder à votre compte.'}
            </p>
          </div>

          {/* Form */}
          {isSignUp ? (
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-5">
                <FormField
                  control={signUpForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nom complet</FormLabel>
                      <div className="relative group">
                        <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />
                        <FormControl>
                          <Input placeholder="Jean Kouassi" {...field} className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium relative z-20" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Profile Photo Upload */}
                <div className="space-y-2">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Photo de Profil (Optionnel)</FormLabel>
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden group"
                    >
                      {profileImage ? (
                        <img
                          src={URL.createObjectURL(profileImage)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
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
                            setProfileImage(e.target.files[0])
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
                        {profileImage ? "Changer la photo" : "Ajouter une photo"}
                      </Button>
                      {profileImage && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 mt-1 h-6"
                          onClick={() => {
                            setProfileImage(null)
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</FormLabel>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="nom@exemple.com"
                            {...field}
                            autoComplete="username webauthn"
                            className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium relative z-20"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Téléphone</FormLabel>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />
                        <FormControl>
                          <Input type="tel" placeholder="+225 07..." {...field} className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium relative z-20" />
                        </FormControl>
                      </div>
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
                          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              autoComplete="new-password webauthn"
                              className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium relative z-20"
                            />
                          </FormControl>
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
                          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium relative z-20"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-muted-foreground hover:text-blue-600 font-medium flex items-center gap-1 ml-auto transition-colors"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showPassword ? 'Masquer' : 'Afficher'} mot de passe
                </button>

                <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5 fill-current" />}
                  Créer mon compte
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
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="nom@exemple.com"
                            {...field}
                            autoComplete="username webauthn"
                            className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium relative z-20"
                          />
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
                        <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all" onClick={() => navigate('/forgot-password')}>
                          Mot de passe oublié ?
                        </button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            autoComplete="current-password webauthn"
                            className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium relative z-20"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground z-30 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5 fill-current" />}
                  Se connecter
                </Button>

                {/* Biometric Trigger Hint */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if ((window as any).PasswordCredential || (window as any).PublicKeyCredential) {
                        document.querySelector('form')?.requestSubmit();
                      }
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-blue-600 transition-colors mt-2"
                  >
                    <Fingerprint className="h-4 w-4" />
                    Connexion Biométrique
                  </button>
                </div>
              </form>
            </Form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 px-2 text-muted-foreground font-bold tracking-widest">Ou</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              {isSignUp ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}
            </p>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-black text-sm uppercase tracking-wider mt-1 hover:underline transition-all"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Se connecter' : 'Créer un compte gratuitement'}
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 flex gap-4 text-xs text-muted-foreground/60 font-medium bg-slate-100/50 px-4 py-2 rounded-full">
          <a href="#" className="hover:text-foreground transition-colors">Termes</a>
          <span>•</span>
          <a href="#" className="hover:text-foreground transition-colors">Confidentialité</a>
          <span>•</span>
          <a href="#" className="hover:text-foreground transition-colors">Aide</a>
        </div>
      </div>
    </div>
  )
}