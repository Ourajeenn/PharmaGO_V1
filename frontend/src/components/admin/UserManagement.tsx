import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    MoreHorizontal,
    Search,
    Trash2,
    UserCog,
    Loader2,
    ShieldAlert,
    CheckCircle,
    XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { Database } from '@/integrations/supabase/types'
import { EditablePatientProfile } from '@/components/dashboard/profiles/EditablePatientProfile'
import { EditablePharmacyProfile } from '@/components/dashboard/profiles/EditablePharmacyProfile'
import { EditableInsurerProfile } from '@/components/dashboard/profiles/EditableInsurerProfile'
import { EditableDoctorProfile } from '@/components/dashboard/profiles/EditableDoctorProfile'
import { EditableDriverProfile } from '@/components/dashboard/profiles/EditableDriverProfile'

type UserRole = Database['public']['Enums']['user_role']

interface UserData {
    id: string
    email: string | null
    name: string | null
    phone: string | null
    role: UserRole
    verified: boolean
    created_at: string
}

interface UserManagementProps {
    roleFilter?: UserRole | 'all'
}

export const UserManagement = ({ roleFilter = 'all' }: UserManagementProps) => {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [roleFilter])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            let query = supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (roleFilter !== 'all') {
                query = query.eq('role', roleFilter)
            }

            const { data, error } = await query

            if (error) throw error

            if (data) {
                setUsers(data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error('Erreur lors du chargement des utilisateurs')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return

        try {
            // Note: Client-side deletion of auth users is not possible with public key.
            // We only delete the user profile from the database. 
            // To fully delete the auth user, you would need an Edge Function with service_role key.

            const { error: dbError } = await supabase
                .from('user_profiles')
                .delete()
                .eq('id', userId)

            if (dbError) throw dbError

            toast.success('Profil utilisateur supprimé')
            fetchUsers()
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error('Erreur lors de la suppression. Vous n\'avez peut-être pas les droits suffisants.')
        }
    }

    const handleVerifyUser = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ verified: !currentStatus })
                .eq('id', userId)

            if (error) throw error

            toast.success(`Utilisateur ${!currentStatus ? 'vérifié' : 'non vérifié'}`)

            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, verified: !currentStatus } : u))
        } catch (error) {
            console.error('Error updating verification:', error)
            toast.error('Erreur lors de la mise à jour')
        }
    }

    const handleEditUser = (user: UserData) => {
        setSelectedUser(user)
        setIsEditOpen(true)
    }

    const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery))
    )

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 border-red-200'
            case 'doctor': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'pharmacy': return 'bg-green-100 text-green-800 border-green-200'
            case 'driver': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'insurer': return 'bg-purple-100 text-purple-800 border-purple-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const renderEditContent = () => {
        if (!selectedUser) return null

        switch (selectedUser.role) {
            case 'patient':
                return <EditablePatientProfile userId={selectedUser.id} />
            case 'pharmacy':
                return <EditablePharmacyProfile userId={selectedUser.id} />
            case 'insurer':
                return <EditableInsurerProfile userId={selectedUser.id} />
            case 'doctor':
                return <EditableDoctorProfile userId={selectedUser.id} />
            case 'driver':
                return <EditableDriverProfile userId={selectedUser.id} />
            default:
                return <div className="p-4 text-center">Édition non disponible pour ce rôle</div>
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un utilisateur..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredUsers.length} utilisateurs trouvés
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date d'inscription</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Aucun utilisateur trouvé
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="font-medium">{user.name || 'Sans nom'}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{user.email || 'Email non renseigné'}</div>
                                        <div className="text-xs text-muted-foreground">{user.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getRoleBadgeColor(user.role)}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.verified ? (
                                            <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 gap-1">
                                                <CheckCircle className="h-3 w-3" /> Vérifié
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 gap-1">
                                                <XCircle className="h-3 w-3" /> Non vérifié
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Ouvrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                    Copier ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleVerifyUser(user.id, user.verified)}>
                                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                                    {user.verified ? 'Révoquer' : 'Vérifier'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                    <UserCog className="mr-2 h-4 w-4" />
                                                    Modifier Profil
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Modifier le profil : {selectedUser?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {renderEditContent()}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
