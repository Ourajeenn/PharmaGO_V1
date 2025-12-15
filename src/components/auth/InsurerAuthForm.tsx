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
import { Loader2, Eye, EyeOff, Shield, CreditCard, FileCheck, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('Insurer registration error:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mb-4"
        >
          ← Retour
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Section informative */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-primary mb-4">
                Espace Assureur
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Intégrez votre système d'assurance à PharmaGo
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Couverture</h3>
                <p className="text-xs text-muted-foreground">Validation automatique</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <CreditCard className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Remboursements</h3>
                <p className="text-xs text-muted-foreground">Traitement rapide</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <FileCheck className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Pré-autorisation</h3>
                <p className="text-xs text-muted-foreground">API intégrée</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Analytiques</h3>
                <p className="text-xs text-muted-foreground">Rapports détaillés</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-3">Avantages Partenaire :</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-blue-500"></Badge>
                  Intégration API complète
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-green-500"></Badge>
                  Réduction des fraudes médicales
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-purple-500"></Badge>
                  Traçabilité des prescriptions
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-orange-500"></Badge>
                  Dashboard de contrôle avancé
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-purple-700">
                <strong>Accréditation requise :</strong> Licence d'assurance, Autorisation CIMA,
                États financiers audités, Garanties bancaires
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Déjà + de 25 assureurs partenaires</span>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <Card className="w-full relative z-10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                {isSignUp ? 'Partenariat Assureur' : 'Connexion Assureur'}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp
                  ? 'Intégrez votre compagnie d\'assurance à notre réseau'
                  : 'Accédez à votre plateforme de gestion'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSignUp ? (
                insuranceProfileType === null ? (
                  // Profile type selection
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold">Choisissez votre type de profil</h3>
                      <p className="text-sm text-muted-foreground">Sélectionniez le type d'assurance que vous proposez</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Assurance Maladie Card */}
                      <button
                        onClick={() => setInsuranceProfileType('maladie')}
                        className="group p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Shield className="h-6 w-6 text-blue-600 group-hover:text-white" />
                          </div>
                          <h4 className="font-semibold text-lg">Assurance Maladie</h4>
                          <p className="text-sm text-muted-foreground">
                            Pour les compagnies d'assurance maladie classique avec couverture médicale standard
                          </p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>✓ Remboursements médicaux</li>
                            <li>✓ Couverture hospitalisation</li>
                            <li>✓ Médicaments prescrits</li>
                          </ul>
                        </div>
                      </button>

                      {/* CMU Card */}
                      <button
                        onClick={() => setInsuranceProfileType('cmu')}
                        className="group p-6 border-2 border-border rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <CreditCard className="h-6 w-6 text-green-600 group-hover:text-white" />
                          </div>
                          <h4 className="font-semibold text-lg">Assurance CMU</h4>
                          <p className="text-sm text-muted-foreground">
                            Pour la Couverture Maladie Universelle destinée aux populations à faible revenu
                          </p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>✓ Accès gratuit aux soins</li>
                            <li>✓ Couverture 100%</li>
                            <li>✓ Tiers-payant intégral</li>
                          </ul>
                        </div>
                      </button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setIsSignUp(false)}
                      className="w-full"
                    >
                      Retour à la connexion
                    </Button>
                  </div>
                ) : (
                  <Form {...signUpForm}>
                    <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                      {/* Back to profile type selection */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setInsuranceProfileType(null)}
                        className="mb-2"
                      >
                        ← Changer le type de profil
                      </Button>

                      <div className="bg-{insuranceProfileType === 'cmu' ? 'green' : 'blue'}-50 p-3 rounded-lg border border-{insuranceProfileType === 'cmu' ? 'green' : 'blue'}-200">
                        <p className="text-sm font-medium text-center">
                          {insuranceProfileType === 'cmu' ? '🟢 Profil CMU Universelle' : '🔵 Profil Assurance Maladie'}
                        </p>
                      </div>

                      <FormField
                        control={signUpForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de la compagnie *</FormLabel>
                            <FormControl>
                              <Input placeholder="NSIA Assurances Vie" {...field} />
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
                            <FormLabel>Nom du représentant *</FormLabel>
                            <FormControl>
                              <Input placeholder="M. Jean Kouassi" {...field} />
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
                            <FormLabel>Email corporatif *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="partenariat@nsia.ci" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={signUpForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone *</FormLabel>
                              <FormControl>
                                <Input placeholder="+225 XX XX XX XX" {...field} />
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
                              <FormLabel>N° Licence CIMA *</FormLabel>
                              <FormControl>
                                <Input placeholder="CIMA2024XXXX" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={signUpForm.control}
                          name="registrationNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>N° Enregistrement *</FormLabel>
                              <FormControl>
                                <Input placeholder="RC2024XXXXXXXX" {...field} />
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
                              <FormLabel>Type d'assurance *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez le type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="sante">Assurance Santé</SelectItem>
                                  <SelectItem value="maladie">Assurance Maladie</SelectItem>
                                  <SelectItem value="cmu">CMU Universelle</SelectItem>
                                  <SelectItem value="vie">Assurance Vie</SelectItem>
                                  <SelectItem value="mixte">Assurance Mixte</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={signUpForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse siège social *</FormLabel>
                            <FormControl>
                              <Input placeholder="Adresse complète du siège" {...field} />
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
                            <FormLabel>Mot de passe *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
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
                            <FormLabel>Confirmer le mot de passe *</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Demander l'accréditation
                      </Button>
                    </form>
                  </Form>
                )
              ) : (
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="partenariat@assurance.ci" {...field} />
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
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Accéder au dashboard
                    </Button>
                  </form>
                </Form>
              )}

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm"
                >
                  {isSignUp
                    ? 'Déjà partenaire ? Se connecter'
                    : 'Nouvelle compagnie ? S\'inscrire'
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}