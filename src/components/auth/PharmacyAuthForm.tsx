import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Eye, EyeOff, Building2, Package, Users, BarChart, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
})

const signUpSchema = z.object({
  pharmacyName: z.string().min(2, 'Le nom de la pharmacie est requis'),
  ownerName: z.string().min(2, 'Le nom du propriétaire est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  phone: z.string().min(8, 'Numéro de téléphone requis'),
  address: z.string().min(10, 'Adresse complète requise'),
  licenseNumber: z.string().min(5, 'Numéro de licence requis'),
  taxId: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

interface PharmacyAuthFormProps {
  onSuccess?: () => void
}

export const PharmacyAuthForm = ({ onSuccess }: PharmacyAuthFormProps) => {
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
      pharmacyName: '',
      ownerName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      licenseNumber: '',
      taxId: ''
    }
  })

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    setLoading(true)
    try {
      const { error } = await signIn(values.email, values.password)
      if (error) throw error

      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue dans votre espace pharmacie!'
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
        name: values.pharmacyName.trim(),
        role: 'pharmacy',
        phone: values.phone.trim(),
        license_number: values.licenseNumber.trim(),
        clinic_address: values.address.trim()
      }

      const { error } = await signUp(values.email.trim(), values.password, userData)

      if (error) {
        console.error('Pharmacy signup error:', error)

        if (error.message.includes('already registered')) {
          throw new Error('Cet email est déjà utilisé. Veuillez vous connecter.')
        }

        throw new Error(error.message || 'Erreur lors de la création du compte')
      }

      toast({
        title: '✅ Demande envoyée',
        description: 'Votre demande d\'inscription sera vérifiée sous 48h.'
      })

      signUpForm.reset()
      setIsSignUp(false)
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('Pharmacy registration error:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 flex items-center justify-center p-4">
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
                Espace Pharmacie
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Gérez vos stocks et commandes efficacement
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <Package className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Gestion Stock</h3>
                <p className="text-xs text-muted-foreground">Inventaire temps réel</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Commandes</h3>
                <p className="text-xs text-muted-foreground">Validation & préparation</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <BarChart className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Analytiques</h3>
                <p className="text-xs text-muted-foreground">Rapports de vente</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <Building2 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Multi-sites</h3>
                <p className="text-xs text-muted-foreground">Gestion centralisée</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-3">Avantages Partenaire :</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-green-500"></Badge>
                  Commission attractive sur chaque vente
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-blue-500"></Badge>
                  Réseau de livreurs dédiés
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-purple-500"></Badge>
                  Outils de gestion avancés
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-orange-500"></Badge>
                  Support technique 24/7
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-700">
                <strong>Documents requis :</strong> Licence pharmacie, Pièce d'identité du propriétaire,
                Justificatif d'adresse, Certification professionnelle
              </p>
            </div>
          </div>

          {/* Formulaire */}
          <Card className="w-full relative z-10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                {isSignUp ? 'Rejoindre PharmaGo' : 'Connexion Pharmacie'}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp
                  ? 'Inscrivez votre pharmacie sur notre plateforme'
                  : 'Accédez à votre tableau de bord pharmacie'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSignUp ? (
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="pharmacyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de la pharmacie *</FormLabel>
                          <FormControl>
                            <Input placeholder="Pharmacie Centrale d'Abidjan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du propriétaire *</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Jean Kouassi" {...field} />
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
                          <FormLabel>Email professionnel *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@pharmacie.com" {...field} />
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
                            <FormLabel>N° Licence *</FormLabel>
                            <FormControl>
                              <Input placeholder="PH2024XXXX" {...field} />
                            </FormControl>
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
                          <FormLabel>Adresse complète *</FormLabel>
                          <FormControl>
                            <Input placeholder="Rue, Quartier, Commune, Ville" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>N° Contribuable (optionnel)</FormLabel>
                          <FormControl>
                            <Input placeholder="CC20240XXXXX" {...field} />
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
                              className="relative z-20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Soumettre ma candidature
                    </Button>
                  </form>
                </Form>
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
                            <Input type="email" placeholder="contact@pharmacie.com" {...field} />
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
                      Accéder au tableau de bord
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
                    : 'Nouvelle pharmacie ? S\'inscrire'
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