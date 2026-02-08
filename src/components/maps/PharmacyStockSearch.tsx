import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Package, AlertTriangle, Check } from 'lucide-react'
import { Pharmacy, InventoryItem } from '@/types/pharmacy'
import { MEDICATIONS_CATALOG } from '@/data/medications'

interface PharmacyStockSearchProps {
    pharmacies: Pharmacy[]
    generateInventory: (pharmacyId: string) => InventoryItem[]
    onSelectPharmacy: (pharmacy: Pharmacy) => void
}

export const PharmacyStockSearch = ({ pharmacies, generateInventory, onSelectPharmacy }: PharmacyStockSearchProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [medicationSearch, setMedicationSearch] = useState('')
    const [stockSearchResults, setStockSearchResults] = useState<{ pharmacy: Pharmacy; item: InventoryItem }[]>([])

    const searchMedicationStock = (query: string) => {
        if (query.length < 2) {
            setStockSearchResults([])
            return
        }

        const results: { pharmacy: Pharmacy; item: InventoryItem }[] = []
        const queryLower = query.toLowerCase()

        pharmacies.forEach(pharmacy => {
            const inventory = generateInventory(pharmacy.id)
            inventory.forEach(item => {
                if ((item.medicationName.toLowerCase().includes(queryLower) ||
                    item.genericName?.toLowerCase().includes(queryLower)) && item.inStock) {
                    results.push({ pharmacy, item })
                }
            })
        })

        results.sort((a, b) => a.item.price - b.item.price)
        setStockSearchResults(results)
    }

    const handleSearch = (value: string) => {
        setMedicationSearch(value)
        searchMedicationStock(value)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30 hover:bg-green-500/20"
                >
                    <Package className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-bold">Chercher un médicament en stock</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        Recherche de stock
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Ex: Doliprane, Amoxicilline, Ibuprofène..."
                            className="pl-9 rounded-xl"
                            value={medicationSearch}
                            onChange={(e) => handleSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {medicationSearch.length < 2 && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-bold uppercase">Médicaments populaires</p>
                            <div className="flex flex-wrap gap-2">
                                {MEDICATIONS_CATALOG.slice(0, 5).map(med => (
                                    <Button
                                        key={med.name}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full text-xs"
                                        onClick={() => handleSearch(med.name)}
                                    >
                                        {med.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {stockSearchResults.length > 0 && (
                        <div className="max-h-[400px] overflow-y-auto space-y-2">
                            <p className="text-xs text-muted-foreground font-bold">
                                {stockSearchResults.length} pharmacie(s) avec ce médicament en stock
                            </p>
                            {stockSearchResults.map((result, idx) => (
                                <div
                                    key={`${result.pharmacy.id}-${idx}`}
                                    className="p-3 rounded-xl border bg-white/50 hover:bg-primary/5 cursor-pointer transition-colors"
                                    onClick={() => {
                                        onSelectPharmacy(result.pharmacy)
                                        setIsOpen(false)
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm">{result.pharmacy.name}</h4>
                                                {result.pharmacy.isOnDuty && (
                                                    <Badge className="bg-amber-100 text-amber-700 text-[10px]">Garde</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{result.pharmacy.commune}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <Badge className="bg-green-100 text-green-700 text-xs">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    {result.item.quantity} en stock
                                                </Badge>
                                                <span className={`font-bold text-sm ${result.pharmacy.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                                    {result.pharmacy.isOpen ? '● Ouverte' : '● Fermée'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-primary">{result.item.price.toLocaleString()}</p>
                                            <p className="text-[10px] text-muted-foreground">FCFA</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {medicationSearch.length >= 2 && stockSearchResults.length === 0 && (
                        <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-3" />
                            <p className="font-bold">Aucune pharmacie trouvée</p>
                            <p className="text-sm text-muted-foreground">Aucune pharmacie n'a ce médicament en stock</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
