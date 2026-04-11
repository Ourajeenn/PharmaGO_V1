import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Save, Loader2, Pill } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

const medicationSchema = z.object({
    name: z.string().min(1, 'Le nom du médicament est requis'),
    dosage: z.string().min(1, 'Le dosage est requis'),
    frequency: z.string().min(1, 'La fréquence est requise'),
    duration: z.string().min(1, 'La durée est requise')
})

const prescriptionSchema = z.object({
    patientId: z.string().min(1, 'Veuillez sélectionner un patient'),
    diagnosis: z.string().min(1, 'Le diagnostic est requis'),
    notes: z.string().optional(),
    medications: z.array(medicationSchema).min(1, 'Ajoutez au moins un médicament')
})

export const PrescriptionForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    const { user } = useAuth()
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [fetchingPatients, setFetchingPatients] = useState(true)

    const form = useForm<z.infer<typeof prescriptionSchema>>({
        resolver: zodResolver(prescriptionSchema),
        defaultValues: {
            patientId: '',
            diagnosis: '',
            notes: '',
            medications: [{ name: '', dosage: '', frequency: '', duration: '' }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'medications'
    })

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('id, name, email')
                    .eq('role', 'patient')
                    .order('name')

                if (error) throw error
                setPatients(data || [])
            } catch (error) {
                console.error('Error fetching patients:', error)
                toast.error('Erreur lors du chargement des patients')
            } finally {
                setFetchingPatients(false)
            }
        }

        fetchPatients()
    }, [])

    const onSubmit = async (values: z.infer<typeof prescriptionSchema>) => {
        if (!user) return

        setLoading(true)
        try {
            // Generate prescription text from medications for legacy compatibility/backup
            const prescriptionText = values.medications
                .map(m => `${m.name} ${m.dosage} (${m.frequency}) pendant ${m.duration}`)
                .join('\n')

            // 1. Create Prescription
            const { error: prescriptionError } = await supabase
                .from('prescriptions')
                .insert({
                    doctor_id: user.id,
                    patient_id: values.patientId,
                    diagnosis: values.diagnosis,
                    medications: values.medications, // Store as JSONB
                    notes: values.notes,
                    status: 'pending',
                    prescription_text: prescriptionText
                })

            if (prescriptionError) throw prescriptionError

            toast.success('Ordonnance créée avec succès')
            form.reset()
            onSuccess?.()
        } catch (error: any) {
            console.error('Error creating prescription:', error)
            toast.error(error.message || 'Erreur lors de la création de l\'ordonnance')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Nouvelle Ordonnance</CardTitle>
                <CardDescription>
                    Remplissez les détails pour créer une ordonnance numérique
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Patient Selection */}
                        <FormField
                            control={form.control}
                            name="patientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Patient</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={fetchingPatients ? "Chargement..." : "Sélectionner un patient"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id}>
                                                    {patient.name || patient.email || 'Patient sans nom'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Diagnosis */}
                        <FormField
                            control={form.control}
                            name="diagnosis"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Diagnostic</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Grippe saisonnière" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Medications List */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <FormLabel>Médicaments</FormLabel>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ name: '', dosage: '', frequency: '', duration: '' })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-4 bg-muted/50">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-medium flex items-center">
                                            <Pill className="h-4 w-4 mr-2 text-primary" />
                                            Médicament {index + 1}
                                        </h4>
                                        {fields.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive/90"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`medications.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Nom</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nom du médicament" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`medications.${index}.dosage`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Dosage</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: 500mg" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`medications.${index}.frequency`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Fréquence</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: 3x par jour" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`medications.${index}.duration`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Durée</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: 5 jours" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                            {form.formState.errors.medications && (
                                <p className="text-sm font-medium text-destructive">
                                    {form.formState.errors.medications.message}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optionnel)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Instructions supplémentaires..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Enregistrer l'ordonnance
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
