import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { COMMUNES } from '@/data/pharmacies'

interface PharmacyFiltersProps {
    selectedCommune: string
    setSelectedCommune: (commune: string) => void
    filterOnDuty: boolean
    setFilterOnDuty: (checked: boolean) => void
    filterOpen: boolean
    setFilterOpen: (checked: boolean) => void
}

export const PharmacyFilters = ({
    selectedCommune,
    setSelectedCommune,
    filterOnDuty,
    setFilterOnDuty,
    filterOpen,
    setFilterOpen
}: PharmacyFiltersProps) => {
    return (
        <div className="p-3 border-b space-y-3 bg-gray-50/50">
            <div className="flex flex-wrap gap-2">
                {COMMUNES.map(commune => (
                    <Button
                        key={commune}
                        variant={selectedCommune === commune ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full text-xs h-7"
                        onClick={() => setSelectedCommune(commune)}
                    >
                        {commune === 'all' ? 'Toutes' : commune}
                    </Button>
                ))}
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Switch
                        id="onDuty"
                        checked={filterOnDuty}
                        onCheckedChange={setFilterOnDuty}
                    />
                    <Label htmlFor="onDuty" className="text-xs font-medium cursor-pointer">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-amber-500 rounded-full" />
                            De garde
                        </span>
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <Switch
                        id="open"
                        checked={filterOpen}
                        onCheckedChange={setFilterOpen}
                    />
                    <Label htmlFor="open" className="text-xs font-medium cursor-pointer">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            Ouvertes
                        </span>
                    </Label>
                </div>
            </div>
        </div>
    )
}
