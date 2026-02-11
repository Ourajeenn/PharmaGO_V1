import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2, Plus, Save } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

const addMedicineSchema = z.object({
    medicineId: z.string().min(1, 'Veuillez sélectionner un médicament'),
    price: z.string().min(1, 'Le prix est requis'),
    quantity: z.string().min(1, 'La quantité est requise').refine(val => parseInt(val) >= 0, 'Quantité invalide'),
    batchNumber: z.string().optional(),
    expiryDate: z.string().optional()
})

export const AddMedicineDialog = ({ onSuccess, onCancel }: { onSuccess?: () => void, onCancel?: () => void }) => {
    const { user } = useAuth()
    const [medicines, setMedicines] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMedicines, setLoadingMedicines] = useState(true)
    const [pharmacyId, setPharmacyId] = useState<string | null>(null)

    const form = useForm<z.infer<typeof addMedicineSchema>>({
        resolver: zodResolver(addMedicineSchema),
        defaultValues: {
            medicineId: '',
            price: '',
            quantity: '',
            batchNumber: '',
            expiryDate: ''
        }
    })

    useEffect(() => {
        const init = async () => {
            if (!user) return

            try {
                // 1. Get Pharmacy ID
                const { data: pharmacy, error: pharmacyError } = await supabase
                    .from('pharmacies')
                    .select('id')
                    .eq('user_id', user.id)
                    .single()

                if (pharmacyError) throw pharmacyError
                if (pharmacy) setPharmacyId(pharmacy.id)

                // 2. Fetch Medicines
                const { data: medicinesData, error: medicinesError } = await supabase
                    .from('medicines')
                    .select('*')
                    .order('name')

                if (medicinesError) throw medicinesError
                setMedicines(medicinesData || [])
            } catch (error) {
                console.error('Error initialization:', error)
                toast.error('Erreur lors du chargement des données')
            } finally {
                setLoadingMedicines(false)
            }
        }

        init()
    }, [user])

    const onSubmit = async (values: z.infer<typeof addMedicineSchema>) => {
        if (!pharmacyId) {
            toast.error('Pharmacie non identifiée')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase
                .from('pharmacy_inventory')
                .insert({
                    pharmacy_id: pharmacyId,
                    medicine_id: values.medicineId,
                    price: parseFloat(values.price),
                    quantity: parseInt(values.quantity),
                    batch_number: values.batchNumber || null,
                    expiry_date: values.expiryDate || null,
                    created_at: new Date().toISOString()
                })

            if (error) throw error

            toast.success('Médicament ajouté au stock')
            form.reset()
            onSuccess?.()
        } catch (error: any) {
            console.error('Error adding medicine:', error)
            toast.error(error.message || 'Erreur lors de l\'ajout')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="medicineId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Médicament</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={loadingMedicines ? "Chargement..." : "Sélectionner un médicament"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-[200px]">
                                        {medicines.map((medicine) => (
                                            <SelectItem key={medicine.id} value={medicine.id}>
                                                {medicine.name} {medicine.dosage && `(${medicine.dosage})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prix (FCFA)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Ex: 5000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantité</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Ex: 100" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="batchNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numéro de lot</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Optionnel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="expiryDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date d'expiration</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading || !pharmacyId}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Ajout...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Ajouter au stock
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </div>
    )
}
