import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Eye, EyeOff, Shield, CreditCard, FileCheck, TrendingUp, ArrowLeft, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'

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
      const userData = {
        name: values.companyName.trim(),
        role: 'insurer',
        phone: values.phone.trim(),
        license_number: values.licenseNumber.trim(),
        company_name: values.companyName.trim()
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
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-6 relative overflow-hidden bg-slate-50">
      <div className="w-full max-w-2xl relative z-10 animate-in zoom-in-95 duration-700">
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
              <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-[0.9]">
                Espace <span className="text-purple-600 tracking-normal italic">Assureur</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {isSignUp ? 'Partenariat & Accréditation' : 'Interface Financière Sécurisée'}
              </p>
            </div>

            {isSignUp ? (
              insuranceProfileType === null ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  <button
                    onClick={() => setInsuranceProfileType('maladie')}
                    className="glass-card p-6 bg-white/20 hover:bg-white/60 transition-all text-left group border-white/40"
                  >
                    <Shield className="h-10 w-10 text-primary mb-4 transition-transform group-hover:scale-110" />
                    <h4 className="text-lg font-black uppercase tracking-tighter mb-2">Assurance Maladie</h4>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">Compagnies classiques, mutuelles et prévoyances professionnelles.</p>
                  </button>
                  <button
                    onClick={() => setInsuranceProfileType('cmu')}
                    className="glass-card p-6 bg-white/20 hover:bg-white/60 transition-all text-left group border-white/40"
                  >
                    <CreditCard className="h-10 w-10 text-green-600 mb-4 transition-transform group-hover:scale-110" />
                    <h4 className="text-lg font-black uppercase tracking-tighter mb-2">Fonds CMU</h4>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">Couverture Maladie Universelle et programmes d'aide sociale d'État.</p>
                  </button>
                  <div className="sm:col-span-2 pt-6">
                    <Button variant="ghost" onClick={() => setIsSignUp(false)} className="w-full text-[10px] font-black uppercase tracking-[0.2em]">Retour vers Authentification</Button>
                  </div>
                </div>
              ) : (
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setInsuranceProfileType(null)}
                      className="mb-2 text-[10px] font-black uppercase tracking-widest text-primary"
                    >
                      ← Changer le type de profil
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={signUpForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Compagnie *</FormLabel>
                            <FormControl>
                              <Input placeholder="NSIA Assurances Vie" {...field} className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold" />
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
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Représentant *</FormLabel>
                            <FormControl>
                              <Input placeholder="M. Jean Kouassi" {...field} className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email corporatif *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="partenariat@assurance.ci" {...field} className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <FormField
                        control={signUpForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tel *</FormLabel>
                            <FormControl>
                              <Input placeholder="+225..." {...field} className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold" />
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
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">CIMA *</FormLabel>
                            <FormControl>
                              <Input placeholder="CIMA..." {...field} className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold" />
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
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold">
                                  <SelectValue placeholder="Cat." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="glass-morphism">
                                <SelectItem value="sante">Santé</SelectItem>
                                <SelectItem value="cmu">CMU</SelectItem>
                                <SelectItem value="mixte">Mixte</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mot de passe *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full h-14 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 transition-all hover:scale-[1.01]" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                      Accréditer la Compagnie
                    </Button>
                  </form>
                </Form>
              )
            ) : (
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-6">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="partenariat@assurance.ci" {...field} className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold" />
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
                          <button type="button" className="text-[10px] font-black uppercase tracking-widest text-purple-600 hover:underline transition-all">
                            Oublié ?
                          </button>
                        </div>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-14 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 transition-all hover:scale-[1.01]" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                    Valider l'Accès
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-8 text-center pt-6 border-t border-white/20">
              <button
                type="button"
                className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-purple-600 transition-colors"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Déjà partenaire ? Se connecter' : 'Compagnie non inscrite ? S\'enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}