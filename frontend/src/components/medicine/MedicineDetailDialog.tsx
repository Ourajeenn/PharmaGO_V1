import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MedicineImageGallery } from './MedicineImageGallery'
import { Star, ShoppingCart, AlertCircle, Package, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'

interface Medicine {
  id: number
  name: string
  category: string
  price: number
  rating: number
  inStock: boolean
  prescription: boolean
  image: string
  images?: string[]
  description?: string
  composition?: string
  dosage?: string
  sideEffects?: string[]
  manufacturer?: string
  ammNumber?: string
  countryOfOrigin?: string
  genericName?: string
}

interface MedicineDetailDialogProps {
  medicine: Medicine | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const MedicineDetailDialog = ({ medicine, open, onOpenChange }: MedicineDetailDialogProps) => {
  const { addToCart } = useCart()

  if (!medicine) return null

  const allImages = medicine.images || [medicine.image]

  const handleAddToCart = () => {
    addToCart({
      medicine: {
        id: medicine.id.toString(),
        name: medicine.name,
        description: medicine.category,
        category: medicine.category,
        requires_prescription: medicine.prescription,
        manufacturer: medicine.manufacturer || '',
        generic_name: '',
        dosage: medicine.dosage || '',
        form: '',
        created_at: '',
        updated_at: ''
      },
      quantity: 1,
      pharmacy_id: 'mock-pharmacy',
      pharmacy_name: 'Pharmacie disponible',
      price: medicine.price
    })
    toast.success(`${medicine.name} ajouté au panier`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{medicine.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Images */}
          <div>
            <MedicineImageGallery images={allImages} medicineName={medicine.name} />
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Price and Stock */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {medicine.price.toLocaleString()} FCFA
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{medicine.rating}</span>
                    <span className="text-sm text-muted-foreground">(127 avis)</span>
                  </div>
                </div>
                <Badge variant={medicine.inStock ? 'default' : 'secondary'}>
                  {medicine.inStock ? 'En stock' : 'Rupture'}
                </Badge>
              </div>

              <Badge variant="outline" className="text-sm">
                {medicine.category}
              </Badge>

              {medicine.prescription && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>Médicament sur ordonnance uniquement</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            {medicine.description && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-sm text-muted-foreground">{medicine.description}</p>
              </div>
            )}

            {/* Composition */}
            {medicine.composition && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Composition
                </h3>
                <p className="text-sm text-muted-foreground">{medicine.composition}</p>
              </div>
            )}

            {/* Dosage */}
            {medicine.dosage && (
              <div className="space-y-2">
                <h3 className="font-semibold">Posologie</h3>
                <p className="text-sm text-muted-foreground">{medicine.dosage}</p>
              </div>
            )}

            {/* Side Effects */}
            {medicine.sideEffects && medicine.sideEffects.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-700">Effets secondaires possibles</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {medicine.sideEffects.map((effect, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      {effect}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Manufacturer & Origin */}
            {(medicine.manufacturer || medicine.countryOfOrigin || medicine.ammNumber) && (
              <div className="space-y-2 text-sm text-muted-foreground bg-secondary/20 p-4 rounded-lg border border-secondary/30">
                {medicine.ammNumber && (
                  <div className="flex justify-between border-b border-secondary/30 pb-2 mb-2">
                    <span className="font-medium text-foreground">N° AMM:</span>
                    <span className="font-mono">{medicine.ammNumber}</span>
                  </div>
                )}
                {medicine.manufacturer && (
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Fabricant:</span>
                    <span>{medicine.manufacturer}</span>
                  </div>
                )}
                {medicine.countryOfOrigin && (
                  <div className="flex justify-between mt-1">
                    <span className="font-medium text-foreground">Pays d'origine:</span>
                    <span>{medicine.countryOfOrigin}</span>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Add to Cart Button */}
            <Button
              className="w-full"
              size="lg"
              disabled={!medicine.inStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Ajouter au panier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
