import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'
import {
    Home,
    ShoppingBag,
    BarChart2,
    Settings,
    LogOut,
    Search,
    Bell,
    User
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PremiumDashboardLayoutProps {
    children: React.ReactNode
    activeTab?: string
}

export const PremiumDashboardLayout = ({ children, activeTab = 'home' }: PremiumDashboardLayoutProps) => {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/auth')
    }

    const navItems = [
        { id: 'home', icon: Home, label: 'Tableau de bord', path: '/dashboard' },
        { id: 'shop', icon: ShoppingBag, label: 'Boutique', path: '/medicaments' },
        { id: 'analytics', icon: BarChart2, label: 'Analyses', path: '#' },
        { id: 'settings', icon: Settings, label: 'Paramètres', path: '#' },
    ]

    return (
        <div className="flex h-screen overflow-hidden mesh-gradient">
            {/* Sidebar - Glass Effect */}
            <aside className="w-20 lg:w-64 glass-sidebar flex flex-col z-50">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <span className="hidden lg:block font-bold text-xl tracking-tight text-foreground/80">PharmaGo</span>
                </div>

                <nav className="flex-1 mt-8 px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => item.path !== '#' && navigate(item.path)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${activeTab === item.id
                                    ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                    : 'text-muted-foreground hover:bg-white/40 hover:text-foreground'
                                }`}
                        >
                            <item.icon className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 ${activeTab === item.id ? 'text-primary' : ''
                                }`} />
                            <span className="hidden lg:block font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/20">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50/50 rounded-xl transition-all group"
                    >
                        <LogOut className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        <span className="hidden lg:block font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                {/* Header - Glass Top Bar */}
                <header className="flex items-center justify-between mb-8 glass-morphism p-4 rounded-2xl border-white/40">
                    <div className="relative flex-1 max-w-md hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-10 bg-white/30 border-white/20 focus:bg-white/50 transition-all rounded-xl"
                        />
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <Button variant="ghost" size="icon" className="relative glass-card w-10 h-10 border-0">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-3 glass-card pl-2 pr-4 py-1 cursor-pointer border-white/40">
                                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                                            {profile?.name?.substring(0, 2).toUpperCase() || 'US'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-sm font-bold text-foreground/80 leading-none">{profile?.name || 'Utilisateur'}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1 capitalize">{profile?.role}</p>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-morphism border-white/20 rounded-xl w-56 mt-2" align="end">
                                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/20" />
                                <DropdownMenuItem className="focus:bg-primary/10 rounded-lg cursor-pointer">
                                    <User className="mr-2 h-4 w-4" /> Profil
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-primary/10 rounded-lg cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" /> Paramètres
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/20" />
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="text-red-500 focus:bg-red-50/50 rounded-lg cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <div className="h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
