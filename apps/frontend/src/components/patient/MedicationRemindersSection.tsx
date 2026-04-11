import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Bell, Clock, Pill, Plus, Edit, Trash2,
    Calendar, CheckCircle, X, Save, Volume2, VolumeX,
    Sun, Moon, Coffee, Utensils, BedDouble, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface MedicationReminder {
    id: string
    medication: string
    dosage: string
    times: string[]
    days: string[]
    isActive: boolean
    notes?: string
    lastTaken?: string
    nextDue?: string
    streakDays: number
}

const DAYS_OF_WEEK = [
    { id: 'lun', label: 'L' },
    { id: 'mar', label: 'M' },
    { id: 'mer', label: 'M' },
    { id: 'jeu', label: 'J' },
    { id: 'ven', label: 'V' },
    { id: 'sam', label: 'S' },
    { id: 'dim', label: 'D' }
]

const TIME_PRESETS = [
    { id: 'morning', label: 'Matin', time: '08:00', icon: Sun },
    { id: 'noon', label: 'Midi', time: '12:00', icon: Coffee },
    { id: 'afternoon', label: 'Après-midi', time: '16:00', icon: Utensils },
    { id: 'evening', label: 'Soir', time: '20:00', icon: Moon },
    { id: 'night', label: 'Coucher', time: '22:00', icon: BedDouble }
]

export const MedicationRemindersSection = () => {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingReminder, setEditingReminder] = useState<MedicationReminder | null>(null)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [soundEnabled, setSoundEnabled] = useState(true)

    // Form state
    const [formMedication, setFormMedication] = useState('')
    const [formDosage, setFormDosage] = useState('')
    const [formTimes, setFormTimes] = useState<string[]>([])
    const [formDays, setFormDays] = useState<string[]>(['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'])

    // Mock reminders
    const [reminders, setReminders] = useState<MedicationReminder[]>([
        {
            id: '1',
            medication: 'Amlodipine 5mg',
            dosage: '1 comprimé',
            times: ['08:00'],
            days: ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'],
            isActive: true,
            lastTaken: '2026-02-06T08:00:00',
            nextDue: '2026-02-07T08:00:00',
            streakDays: 45
        },
        {
            id: '2',
            medication: 'Metformine 500mg',
            dosage: '1 comprimé',
            times: ['08:00', '20:00'],
            days: ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'],
            isActive: true,
            lastTaken: '2026-02-06T08:00:00',
            nextDue: '2026-02-06T20:00:00',
            streakDays: 30
        },
        {
            id: '3',
            medication: 'Vitamine D3',
            dosage: '1 goutte',
            times: ['12:00'],
            days: ['lun', 'mer', 'ven'],
            isActive: true,
            streakDays: 12
        }
    ])

    // Get upcoming reminders for today
    const upcomingToday = reminders.filter(r => r.isActive && r.nextDue).sort((a, b) =>
        new Date(a.nextDue!).getTime() - new Date(b.nextDue!).getTime()
    )

    const toggleTime = (time: string) => {
        setFormTimes(prev =>
            prev.includes(time)
                ? prev.filter(t => t !== time)
                : [...prev, time]
        )
    }

    const toggleDay = (day: string) => {
        setFormDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        )
    }

    const toggleReminderActive = (id: string) => {
        setReminders(prev => prev.map(r =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
        ))
        toast.success('Rappel mis à jour')
    }

    const markAsTaken = (id: string) => {
        setReminders(prev => prev.map(r =>
            r.id === id ? { ...r, lastTaken: new Date().toISOString(), streakDays: r.streakDays + 1 } : r
        ))
        toast.success('Médicament pris ✓', { description: 'Excellente observance!' })
    }

    const deleteReminder = (id: string) => {
        setReminders(prev => prev.filter(r => r.id !== id))
        toast.success('Rappel supprimé')
    }

    const saveReminder = () => {
        if (!formMedication || formTimes.length === 0) {
            toast.error('Veuillez remplir tous les champs obligatoires')
            return
        }

        const newReminder: MedicationReminder = {
            id: Date.now().toString(),
            medication: formMedication,
            dosage: formDosage,
            times: formTimes,
            days: formDays,
            isActive: true,
            streakDays: 0
        }

        setReminders(prev => [...prev, newReminder])
        setIsAddDialogOpen(false)
        resetForm()
        toast.success('Rappel créé avec succès')
    }

    const resetForm = () => {
        setFormMedication('')
        setFormDosage('')
        setFormTimes([])
        setFormDays(['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'])
    }

    const formatTime = (time: string) => {
        return time
    }

    const getTimeIcon = (times: string[]) => {
        if (times.includes('08:00')) return <Sun className="h-4 w-4 text-yellow-500" />
        if (times.includes('20:00')) return <Moon className="h-4 w-4 text-indigo-500" />
        return <Clock className="h-4 w-4 text-gray-500" />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Rappels Médicaments</h3>
                    <p className="text-sm text-muted-foreground">Ne manquez plus jamais une prise</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="notifications" className="text-xs">Notifications</Label>
                        <Switch
                            id="notifications"
                            checked={notificationsEnabled}
                            onCheckedChange={setNotificationsEnabled}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        <Switch
                            checked={soundEnabled}
                            onCheckedChange={setSoundEnabled}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-card border-primary/20 bg-primary/5">
                    <CardContent className="p-4 text-center">
                        <Bell className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="text-3xl font-black">{reminders.filter(r => r.isActive).length}</p>
                        <p className="text-xs text-muted-foreground">Rappels actifs</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                        <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                        <p className="text-3xl font-black text-green-700">
                            {Math.max(...reminders.map(r => r.streakDays))}
                        </p>
                        <p className="text-xs text-muted-foreground">Meilleure série (jours)</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-orange-200 bg-orange-50">
                    <CardContent className="p-4 text-center">
                        <Clock className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                        <p className="text-3xl font-black text-orange-700">
                            {upcomingToday.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Prises aujourd'hui</p>
                    </CardContent>
                </Card>
            </div>

            {/* Next Upcoming */}
            {upcomingToday.length > 0 && (
                <Card className="glass-card border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl animate-pulse">
                                    <Bell className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 font-bold uppercase">Prochain rappel</p>
                                    <p className="font-bold text-lg">{upcomingToday[0].medication}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {upcomingToday[0].dosage} • {upcomingToday[0].times[0]}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => markAsTaken(upcomingToday[0].id)}
                                className="bg-green-600 hover:bg-green-700 rounded-xl"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" /> Pris
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reminders List */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{reminders.length} rappel(s) configuré(s)</p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" /> Nouveau rappel
                </Button>
            </div>

            <div className="grid gap-4">
                {reminders.map((reminder) => (
                    <Card key={reminder.id} className={`glass-card transition-all ${!reminder.isActive ? 'opacity-50' : ''}`}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${reminder.isActive ? 'bg-primary/10' : 'bg-gray-100'}`}>
                                        <Pill className={`h-5 w-5 ${reminder.isActive ? 'text-primary' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold">{reminder.medication}</h4>
                                            {reminder.streakDays >= 7 && (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                                    🔥 {reminder.streakDays}j
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{reminder.dosage}</p>
                                        <div className="flex gap-3 mt-2">
                                            <div className="flex items-center gap-1 text-xs">
                                                {getTimeIcon(reminder.times)}
                                                <span>{reminder.times.join(', ')}</span>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {DAYS_OF_WEEK.map(day => (
                                                    <span
                                                        key={day.id}
                                                        className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${reminder.days.includes(day.id)
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 text-gray-400'
                                                            }`}
                                                    >
                                                        {day.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={reminder.isActive}
                                        onCheckedChange={() => toggleReminderActive(reminder.id)}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-700"
                                        onClick={() => deleteReminder(reminder.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Reminder Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            Nouveau Rappel
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Médicament *</Label>
                            <Input
                                placeholder="Ex: Amlodipine 5mg"
                                value={formMedication}
                                onChange={(e) => setFormMedication(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Dosage</Label>
                            <Input
                                placeholder="Ex: 1 comprimé"
                                value={formDosage}
                                onChange={(e) => setFormDosage(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Heures de prise *</Label>
                            <div className="flex flex-wrap gap-2">
                                {TIME_PRESETS.map(preset => {
                                    const Icon = preset.icon
                                    return (
                                        <Button
                                            key={preset.id}
                                            type="button"
                                            variant={formTimes.includes(preset.time) ? 'default' : 'outline'}
                                            size="sm"
                                            className="rounded-lg"
                                            onClick={() => toggleTime(preset.time)}
                                        >
                                            <Icon className="h-3 w-3 mr-1" />
                                            {preset.label}
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Jours</Label>
                            <div className="flex gap-1">
                                {DAYS_OF_WEEK.map(day => (
                                    <Button
                                        key={day.id}
                                        type="button"
                                        variant={formDays.includes(day.id) ? 'default' : 'outline'}
                                        size="sm"
                                        className="w-10 h-10 rounded-lg p-0"
                                        onClick={() => toggleDay(day.id)}
                                    >
                                        {day.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                            Annuler
                        </Button>
                        <Button onClick={saveReminder}>
                            <Save className="h-4 w-4 mr-2" /> Créer rappel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default MedicationRemindersSection
