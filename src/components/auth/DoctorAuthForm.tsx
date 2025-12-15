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
import { Loader2, Eye, EyeOff, Stethoscope, FileText, Users, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
  experience: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

interface DoctorAuthFormProps {
  onSuccess?: () => void
}

export const DoctorAuthForm = ({ onSuccess }: DoctorAuthFormProps) => {
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
        clinic_address: values.experience?.trim() || undefined
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-cyan-50 flex items-center justify-center p-4">
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
                Espace Médecin
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Prescrivez et validez vos ordonnances numériques
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">E-ordonnances</h3>
                <p className="text-xs text-muted-foreground">Création sécurisée</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Patients</h3>
                <p className="text-xs text-muted-foreground">Suivi centralisé</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Validation</h3>
                <p className="text-xs text-muted-foreground">QR Code sécurisé</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                <Stethoscope className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Télémédecine</h3>
                <p className="text-xs text-muted-foreground">Consultations à distance</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-3">Fonctionnalités Médecin :</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-blue-500"></Badge>
                  Prescriptions numériques avec QR Code
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-green-500"></Badge>
                  Dossier médical partagé sécurisé
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-purple-500"></Badge>
                  Validation ordonnances pharmacies
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-orange-500"></Badge>
                  Interface avec assurances/CMU
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-700">
                <strong>Documents requis :</strong> Diplôme de médecine, Inscription ordre des médecins,
                Pièce d'identité, Justificatif d'exercice
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Stethoscope className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Rejoignez + de 500 médecins</span>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <Card className="w-full relative z-10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <Stethoscope className="h-6 w-6 text-primary" />
                {isSignUp ? 'Inscription Médecin' : 'Connexion Médecin'}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp
                  ? 'Rejoignez la plateforme de prescription numérique'
                  : 'Accédez à votre interface de prescription'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSignUp ? (
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet *</FormLabel>
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
                            <Input type="email" placeholder="dr.kouassi@hopital.ci" {...field} />
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
                        name="medicalLicense"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>N° Ordre des Médecins *</FormLabel>
                            <FormControl>
                              <Input placeholder="OM2024XXXX" {...field} />
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
                          <FormLabel>Spécialité *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre spécialité" />
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

                    <FormField
                      control={signUpForm.control}
                      name="hospital"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Établissement (optionnel)</FormLabel>
                          <FormControl>
                            <Input placeholder="CHU Treichville, Clinique Pasteur..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Années d'expérience (optionnel)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 10 ans" {...field} />
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
                            <Input type="email" placeholder="dr.kouassi@hopital.ci" {...field} />
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
                      Accéder aux prescriptions
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
                    ? 'Déjà inscrit ? Se connecter'
                    : 'Nouveau praticien ? S\'inscrire'
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