import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, User, Mail, Phone, Lock, HeartPulse, Zap, Eye, EyeOff } from 'lucide-react'
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
      const { error } = await signUp(values.email, values.password, {
        name: values.name,
        phone: values.phone,
        role: 'patient'
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
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
                <HeartPulse className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-[0.9]">
                Espace <span className="text-primary tracking-normal italic">Patient</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {isSignUp ? 'Rejoignez l\'excellence logistique' : 'Authentification sécurisée'}
              </p>
            </div>

            {isSignUp ? (
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-5">
                  <FormField
                    control={signUpForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom complet</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                            <Input placeholder="Jean Kouassi" {...field} className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold relative z-0" />
                          </div>
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                            <Input
                              type="email"
                              placeholder="nom@exemple.com"
                              {...field}
                              autoComplete="username webauthn"
                              className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold relative z-0"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signUpForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Téléphone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                            <Input type="tel" placeholder="+225 07..." {...field} className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold relative z-0" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              autoComplete="new-password webauthn"
                              className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold relative z-0"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground z-20"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signUpForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirmer mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold relative z-0"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-14 rounded-xl bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                    S'inscrire Maintenant
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="nom@exemple.com"
                              {...field}
                              autoComplete="username webauthn"
                              className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between ml-1">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mot de passe</FormLabel>
                          <button type="button" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all" onClick={() => navigate('/forgot-password')}>
                            Oublié ?
                          </button>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              autoComplete="current-password webauthn"
                              className="pl-10 h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-14 rounded-xl bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                    Accéder au Dashboard
                  </Button>

                  {/* Biometric Trigger Hint */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        // Trigger browser credential manager which usually invokes FaceID/TouchID
                        if ((window as any).PasswordCredential || (window as any).PublicKeyCredential) {
                          // This is a hint to the browser to show the auth dialog
                          // In a real PWA, you might use navigator.credentials.get({ password: true })
                          document.querySelector('form')?.requestSubmit();
                        }
                      }}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mt-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-fingerprint"><path d="M2.5 12.5a10 10 0 1 1 20 0" /><path d="M12 21a9 9 0 1 0 0-18" /><path d="M12 9a3 3 0 1 0 0 6" /><path d="M9 12a3 3 0 1 0 0 6" /></svg>
                      Connexion Biométrique (Si disponible)
                    </button>
                  </div>
                </form>
              </Form>
            )}

            <div className="mt-8 text-center pt-6 border-t border-white/20">
              <button
                type="button"
                className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Déjà un compte ? Se connecter' : 'Nouveau ? Créer un compte'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}