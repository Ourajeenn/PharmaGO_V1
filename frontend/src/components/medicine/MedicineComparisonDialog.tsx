import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useComparison } from '@/contexts/ComparisonContext'
import { X, AlertCircle, Package, FileText, DollarSign, Download } from 'lucide-react'
import { exportComparisonToPDF } from '@/lib/pdfExport'
import { toast } from 'sonner'

interface MedicineComparisonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const MedicineComparisonDialog = ({ open, onOpenChange }: MedicineComparisonDialogProps) => {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison()

  const handleExportPDF = () => {
    try {
      exportComparisonToPDF(comparisonList)
      toast.success('PDF généré avec succès!')
    } catch (error) {
      toast.error('Erreur lors de la génération du PDF')
      console.error('PDF export error:', error)
    }
  }

  if (comparisonList.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Comparaison de médicaments</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mb-4 opacity-50" />
            <p>Aucun médicament sélectionné pour la comparaison</p>
            <p className="text-sm mt-2">Ajoutez des médicaments depuis la liste pour les comparer</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Comparaison de médicaments ({comparisonList.length})</DialogTitle>
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Exporter PDF
              </Button>
              <Button variant="outline" size="sm" onClick={clearComparison}>
                Effacer tout
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Images et noms */}
            <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${comparisonList.length}, 1fr)` }}>
              {comparisonList.map((medicine) => (
                <div key={medicine.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => removeFromComparison(medicine.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="space-y-3">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={medicine.image}
                        alt={medicine.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm">{medicine.name}</h3>
                      <Badge variant="outline" className="text-xs">{medicine.category}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prix */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Prix</h3>
              </div>
              <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${comparisonList.length}, 1fr)` }}>
                {comparisonList.map((medicine) => (
                  <div key={medicine.id} className="space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      {medicine.price.toLocaleString()} FCFA
                    </div>
                    <Badge variant={medicine.inStock ? 'default' : 'secondary'}>
                      {medicine.inStock ? 'En stock' : 'Rupture'}
                    </Badge>
                    {medicine.prescription && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>Sur ordonnance</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Description</h3>
              </div>
              <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${comparisonList.length}, 1fr)` }}>
                {comparisonList.map((medicine) => (
                  <div key={medicine.id} className="text-sm text-muted-foreground">
                    {medicine.description || 'Non spécifié'}
                  </div>
                ))}
              </div>
            </div>

            {/* Composition */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Composition</h3>
              </div>
              <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${comparisonList.length}, 1fr)` }}>
                {comparisonList.map((medicine) => (
                  <div key={medicine.id} className="text-sm text-muted-foreground">
                    {medicine.composition || 'Non spécifié'}
                  </div>
                ))}
              </div>
            </div>

            {/* Posologie */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Posologie</h3>
              <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${comparisonList.length}, 1fr)` }}>
                {comparisonList.map((medicine) => (
                  <div key={medicine.id} className="text-sm text-muted-foreground">
                    {medicine.dosage || 'Non spécifié'}
                  </div>
                ))}
              </div>
            </div>

            {/* Effets secondaires */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-amber-700 mb-3">Effets secondaires possibles</h3>
              <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${comparisonList.length}, 1fr)` }}>
                {comparisonList.map((medicine) => (
                  <div key={medicine.id}>
                    {medicine.sideEffects && medicine.sideEffects.length > 0 ? (
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {medicine.sideEffects.map((effect, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                            <span>{effect}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground">Non spécifié</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fabricant */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Fabricant</h3>
              <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${comparisonList.length}, 1fr)` }}>
                {comparisonList.map((medicine) => (
                  <div key={medicine.id} className="text-sm text-muted-foreground">
                    {medicine.manufacturer || 'Non spécifié'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
