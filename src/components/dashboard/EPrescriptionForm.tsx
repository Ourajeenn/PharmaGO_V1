import { useState, useRef, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Plus, Trash2, Save, Loader2, Pill, Send, FileText,
    Smartphone, Mail, MessageCircle, Shield, Clock,
    CheckCircle, AlertTriangle, Download, Eye
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

const medicationSchema = z.object({
    name: z.string().min(1, 'Le nom du médicament est requis'),
    dosage: z.string().min(1, 'Le dosage est requis'),
    frequency: z.string().min(1, 'La fréquence est requise'),
    duration: z.string().min(1, 'La durée est requise'),
    instructions: z.string().optional()
})

const ePrescriptionSchema = z.object({
    patientId: z.string().min(1, 'Veuillez sélectionner un patient'),
    patientPhone: z.string().optional(),
    patientEmail: z.string().email().optional().or(z.literal('')),
    diagnosis: z.string().min(1, 'Le diagnostic est requis'),
    notes: z.string().optional(),
    medications: z.array(medicationSchema).min(1, 'Ajoutez au moins un médicament'),
    validityDays: z.number().min(1).max(365),
    deliveryChannels: z.object({
        app: z.boolean(),
        sms: z.boolean(),
        email: z.boolean(),
        whatsapp: z.boolean()
    })
})

interface EPrescriptionFormProps {
    onSuccess?: () => void
    onPreview?: (prescription: any) => void
}

export const EPrescriptionForm = ({ onSuccess, onPreview }: EPrescriptionFormProps) => {
    const { user, profile } = useAuth()
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [fetchingPatients, setFetchingPatients] = useState(true)
    const [signatureData, setSignatureData] = useState<string | null>(null)
    const [step, setStep] = useState<'form' | 'sign' | 'preview' | 'sent'>('form')
    const [prescriptionId, setPrescriptionId] = useState<string | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<any>(null)

    const form = useForm<z.infer<typeof ePrescriptionSchema>>({
        resolver: zodResolver(ePrescriptionSchema),
        defaultValues: {
            patientId: '',
            patientPhone: '',
            patientEmail: '',
            diagnosis: '',
            notes: '',
            medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
            validityDays: 90,
            deliveryChannels: {
                app: true,
                sms: false,
                email: false,
                whatsapp: false
            }
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
                    .select('id, name, email, phone')
                    .eq('role', 'patient')
                    .order('name')

                if (error) throw error
                setPatients(data || [])
            } catch (error) {
                console.error('Error fetching patients:', error)
                // Mock patients for demo
                setPatients([
                    { id: 'mock-1', name: 'Aya Kouassi', email: 'aya@example.com', phone: '+225 07 12 34 56' },
                    { id: 'mock-2', name: 'Koné Ibrahim', email: 'kone@example.com', phone: '+225 05 98 76 54' },
                    { id: 'mock-3', name: 'Adjoua Traoré', email: 'adjoua@example.com', phone: '+225 01 23 45 67' }
                ])
            } finally {
                setFetchingPatients(false)
            }
        }

        fetchPatients()
    }, [])

    // Canvas signature handling
    useEffect(() => {
        if (step === 'sign' && canvasRef.current) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.fillStyle = '#FFFFFF'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.strokeStyle = '#1a1a2e'
                ctx.lineWidth = 2
                ctx.lineCap = 'round'
            }
        }
    }, [step])

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true)
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const rect = canvas.getBoundingClientRect()
        ctx?.beginPath()
        ctx?.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        const rect = canvasRef.current.getBoundingClientRect()
        ctx?.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctx?.stroke()
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearSignature = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx?.fillRect(0, 0, canvas.width, canvas.height)
        setSignatureData(null)
    }

    const saveSignature = () => {
        if (!canvasRef.current) return
        const dataUrl = canvasRef.current.toDataURL('image/png')
        setSignatureData(dataUrl)
        setStep('preview')
    }

    const handlePatientChange = (patientId: string) => {
        const patient = patients.find(p => p.id === patientId)
        if (patient) {
            setSelectedPatient(patient)
            form.setValue('patientPhone', patient.phone || '')
            form.setValue('patientEmail', patient.email || '')
        }
    }

    const proceedToSign = () => {
        form.trigger().then(isValid => {
            if (isValid) {
                setStep('sign')
            }
        })
    }

    const sendPrescription = async () => {
        if (!user || !signatureData) return

        setLoading(true)
        try {
            const values = form.getValues()
            const newPrescriptionId = `RX-${Date.now().toString(36).toUpperCase()}`

            // Generate prescription text
            const prescriptionText = values.medications
                .map(m => `${m.name} ${m.dosage} (${m.frequency}) pendant ${m.duration}${m.instructions ? ` - ${m.instructions}` : ''}`)
                .join('\n')

            // Simulate API call - in production this would create in Supabase
            // and trigger Edge Functions for SMS/Email/WhatsApp delivery

            await new Promise(resolve => setTimeout(resolve, 1500))

            const deliveryMethods = []
            if (values.deliveryChannels.app) deliveryMethods.push('Application')
            if (values.deliveryChannels.sms) deliveryMethods.push('SMS')
            if (values.deliveryChannels.email) deliveryMethods.push('Email')
            if (values.deliveryChannels.whatsapp) deliveryMethods.push('WhatsApp')

            setPrescriptionId(newPrescriptionId)
            setStep('sent')

            toast.success(`Ordonnance envoyée via: ${deliveryMethods.join(', ')}`)
            onSuccess?.()
        } catch (error: any) {
            console.error('Error sending prescription:', error)
            toast.error(error.message || 'Erreur lors de l\'envoi de l\'ordonnance')
        } finally {
            setLoading(false)
        }
    }

    const downloadPDF = () => {
        toast.success('Téléchargement du PDF en cours...')
        // In production: generate and download PDF
    }

    const values = form.watch()

    return (
        <Card className="w-full border-2 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            E-Prescription
                        </CardTitle>
                        <CardDescription>
                            Ordonnance électronique sécurisée avec signature numérique
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Sécurisé
                    </Badge>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 mt-4">
                    {['form', 'sign', 'preview', 'sent'].map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s ? 'bg-primary text-white' :
                                ['form', 'sign', 'preview', 'sent'].indexOf(step) > i ? 'bg-green-500 text-white' :
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                {['form', 'sign', 'preview', 'sent'].indexOf(step) > i ? '✓' : i + 1}
                            </div>
                            {i < 3 && <div className={`w-8 h-0.5 ${['form', 'sign', 'preview', 'sent'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200'
                                }`} />}
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                {/* Step 1: Form */}
                {step === 'form' && (
                    <Form {...form}>
                        <form className="space-y-6">
                            {/* Patient Selection */}
                            <FormField
                                control={form.control}
                                name="patientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Patient</FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val)
                                                handlePatientChange(val)
                                            }}
                                            defaultValue={field.value}
                                        >
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

                            {/* Patient Contact Info */}
                            {selectedPatient && (
                                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                                    <FormField
                                        control={form.control}
                                        name="patientPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Téléphone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+225 XX XX XX XX" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="patientEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="email@example.com" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Diagnosis */}
                            <FormField
                                control={form.control}
                                name="diagnosis"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Diagnostic</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Angine bactérienne" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Medications */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <FormLabel className="flex items-center gap-2">
                                        <Pill className="h-4 w-4" />
                                        Médicaments prescrits
                                    </FormLabel>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Ajouter
                                    </Button>
                                </div>

                                {fields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-lg space-y-4 bg-blue-50/50">
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

                                        <div className="grid grid-cols-2 gap-3">
                                            <FormField
                                                control={form.control}
                                                name={`medications.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Nom</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Amoxicilline" {...field} />
                                                        </FormControl>
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
                                                            <Input placeholder="1g" {...field} />
                                                        </FormControl>
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
                                                            <Input placeholder="3x par jour" {...field} />
                                                        </FormControl>
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
                                                            <Input placeholder="7 jours" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name={`medications.${index}.instructions`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Instructions (optionnel)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Prendre pendant les repas" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Validity & Delivery Channels */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="validityDays"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Validité (jours)
                                            </FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(parseInt(val))}
                                                defaultValue={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="30">30 jours</SelectItem>
                                                    <SelectItem value="90">90 jours (standard)</SelectItem>
                                                    <SelectItem value="180">6 mois</SelectItem>
                                                    <SelectItem value="365">1 an</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel className="flex items-center gap-2">
                                        <Send className="h-4 w-4" />
                                        Canaux d'envoi
                                    </FormLabel>
                                    <div className="grid grid-cols-2 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="deliveryChannels.app"
                                            render={({ field }) => (
                                                <div className="flex items-center gap-2 p-2 rounded border bg-green-50 border-green-200">
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled />
                                                    <Smartphone className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm">App</span>
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="deliveryChannels.sms"
                                            render={({ field }) => (
                                                <div className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${field.value ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                                                    onClick={() => field.onChange(!field.value)}>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span className="text-sm">SMS</span>
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="deliveryChannels.email"
                                            render={({ field }) => (
                                                <div className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${field.value ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                                                    onClick={() => field.onChange(!field.value)}>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <Mail className="h-4 w-4" />
                                                    <span className="text-sm">Email</span>
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="deliveryChannels.whatsapp"
                                            render={({ field }) => (
                                                <div className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${field.value ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                                                    onClick={() => field.onChange(!field.value)}>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <span className="text-sm">📱 WhatsApp</span>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes / Conseils (Optionnel)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Conseils hygiéno-diététiques, contre-indications à surveiller..." {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <Button type="button" className="w-full" onClick={proceedToSign}>
                                Passer à la signature
                                <Shield className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </Form>
                )}

                {/* Step 2: Signature */}
                {step === 'sign' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Shield className="h-12 w-12 mx-auto text-primary mb-2" />
                            <h3 className="text-lg font-semibold">Signature Numérique</h3>
                            <p className="text-sm text-muted-foreground">
                                Signez dans le cadre ci-dessous pour valider l'ordonnance
                            </p>
                        </div>

                        <div className="border-2 border-dashed border-primary/30 rounded-lg p-2">
                            <canvas
                                ref={canvasRef}
                                width={400}
                                height={150}
                                className="w-full cursor-crosshair rounded bg-white"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={clearSignature} className="flex-1">
                                Effacer
                            </Button>
                            <Button variant="outline" onClick={() => setStep('form')} className="flex-1">
                                Retour
                            </Button>
                            <Button onClick={saveSignature} className="flex-1">
                                Valider la signature
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Preview */}
                {step === 'preview' && (
                    <div className="space-y-6">
                        <div className="border rounded-lg p-6 bg-white shadow-sm">
                            {/* Prescription Header */}
                            <div className="flex justify-between items-start border-b pb-4 mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-primary">ORDONNANCE</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Dr. {profile?.name || 'Médecin Pharma-Go'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        N° Ordre: XXXXX | Abidjan, Côte d'Ivoire
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">
                                        {new Date().toLocaleDateString('fr-FR')}
                                    </p>
                                    <Badge variant="outline" className="mt-1">
                                        Validité: {values.validityDays} jours
                                    </Badge>
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="mb-4 p-3 bg-muted/50 rounded">
                                <p className="text-sm">
                                    <strong>Patient:</strong> {selectedPatient?.name || 'Patient'}
                                </p>
                                <p className="text-sm">
                                    <strong>Diagnostic:</strong> {values.diagnosis}
                                </p>
                            </div>

                            {/* Medications */}
                            <div className="space-y-3 mb-4">
                                <p className="font-medium">Prescription:</p>
                                {values.medications.map((med, i) => (
                                    <div key={i} className="pl-4 border-l-2 border-primary">
                                        <p className="font-medium">{med.name} {med.dosage}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {med.frequency} pendant {med.duration}
                                        </p>
                                        {med.instructions && (
                                            <p className="text-xs italic text-muted-foreground">{med.instructions}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Notes */}
                            {values.notes && (
                                <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                                    <p className="text-sm"><strong>Notes:</strong> {values.notes}</p>
                                </div>
                            )}

                            {/* Signature */}
                            <div className="flex justify-between items-end pt-4 border-t">
                                <div className="text-xs text-muted-foreground">
                                    <p>Ordonnance électronique sécurisée</p>
                                    <p>Générée via Pharma-Go</p>
                                </div>
                                {signatureData && (
                                    <div className="text-center">
                                        <img src={signatureData} alt="Signature" className="h-16 border rounded" />
                                        <p className="text-xs text-muted-foreground mt-1">Signature numérique</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delivery Summary */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="font-medium mb-2">Envoi via:</p>
                            <div className="flex gap-2 flex-wrap">
                                {values.deliveryChannels.app && <Badge>📱 Application</Badge>}
                                {values.deliveryChannels.sms && <Badge variant="outline">💬 SMS</Badge>}
                                {values.deliveryChannels.email && <Badge variant="outline">📧 Email</Badge>}
                                {values.deliveryChannels.whatsapp && <Badge variant="outline">📲 WhatsApp</Badge>}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setStep('sign')} className="flex-1">
                                Modifier
                            </Button>
                            <Button onClick={sendPrescription} className="flex-1" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Envoi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Envoyer l'ordonnance
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Sent Confirmation */}
                {step === 'sent' && (
                    <div className="text-center space-y-6 py-8">
                        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-green-700">Ordonnance envoyée!</h3>
                            <p className="text-muted-foreground mt-2">
                                Le patient recevra l'ordonnance via les canaux sélectionnés
                            </p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Numéro d'ordonnance</p>
                            <p className="text-xl font-mono font-bold">{prescriptionId}</p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={downloadPDF}>
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger PDF
                            </Button>
                            <Button onClick={() => {
                                setStep('form')
                                form.reset()
                                setSignatureData(null)
                                setSelectedPatient(null)
                            }}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nouvelle ordonnance
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default EPrescriptionForm
