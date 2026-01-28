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
    activeTab?: string,
    role?: 'patient' | 'pharmacy' | 'driver' | 'doctor' | 'insurer' | 'admin' | 'visitor'
}

export const PremiumDashboardLayout = ({ children, activeTab = 'home', role = 'patient' }: PremiumDashboardLayoutProps) => {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/auth')
    }

    // Role-based Color Mapping
    const roleThemes = {
        patient: {
            primary: 'text-blue-600',
            bg: 'bg-blue-600',
            light: 'bg-blue-500/10',
            border: 'border-blue-200/50',
            gradient: 'from-blue-600 to-indigo-600',
            shadow: 'shadow-blue-500/20'
        },
        pharmacy: {
            primary: 'text-green-600',
            bg: 'bg-green-600',
            light: 'bg-green-500/10',
            border: 'border-green-200/50',
            gradient: 'from-green-600 to-emerald-600',
            shadow: 'shadow-green-500/20'
        },
        driver: {
            primary: 'text-orange-600',
            bg: 'bg-orange-600',
            light: 'bg-orange-500/10',
            border: 'border-orange-200/50',
            gradient: 'from-orange-500 to-amber-600',
            shadow: 'shadow-orange-500/20'
        },
        doctor: {
            primary: 'text-cyan-600',
            bg: 'bg-cyan-600',
            light: 'bg-cyan-500/10',
            border: 'border-cyan-200/50',
            gradient: 'from-cyan-600 to-blue-600',
            shadow: 'shadow-cyan-500/20'
        },
        insurer: {
            primary: 'text-purple-600',
            bg: 'bg-purple-600',
            light: 'bg-purple-500/10',
            border: 'border-purple-200/50',
            gradient: 'from-purple-600 to-violet-600',
            shadow: 'shadow-purple-500/20'
        },
        admin: {
            primary: 'text-slate-800',
            bg: 'bg-slate-800',
            light: 'bg-slate-500/10',
            border: 'border-slate-200/50',
            gradient: 'from-slate-700 to-slate-900',
            shadow: 'shadow-slate-500/20'
        },
        visitor: {
            primary: 'text-gray-600',
            bg: 'bg-gray-600',
            light: 'bg-gray-500/10',
            border: 'border-gray-200/50',
            gradient: 'from-gray-600 to-gray-700',
            shadow: 'shadow-gray-500/20'
        }
    }

    const theme = roleThemes[role] || roleThemes['patient']

    const navItems = [
        { id: 'home', icon: Home, label: 'Tableau de bord', path: '/dashboard' },
        { id: 'shop', icon: ShoppingBag, label: 'Médicaments', path: '/medicaments' },
        { id: 'analytics', icon: BarChart2, label: 'Analyses', path: '#' },
        { id: 'settings', icon: Settings, label: 'Paramètres', path: '#' },
    ]

    return (
        <div className="flex h-screen overflow-hidden mesh-gradient">
            {/* Sidebar - Glass Effect */}
            <aside className="w-20 lg:w-64 glass-sidebar flex flex-col z-50">
                <div className="p-6 flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-xl">{role.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="hidden lg:block font-bold text-xl tracking-tight text-foreground/80">PharmaGo</span>
                </div>

                <nav className="flex-1 mt-8 px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => item.path !== '#' && navigate(item.path)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${activeTab === item.id
                                ? `${theme.light} ${theme.primary} shadow-sm border ${theme.border}`
                                : 'text-muted-foreground hover:bg-white/40 hover:text-foreground'
                                }`}
                        >
                            <item.icon className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 ${activeTab === item.id ? theme.primary : ''
                                }`} />
                            <span className="hidden lg:block font-bold text-xs uppercase tracking-widest">{item.label}</span>
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
                                    <Avatar className={`h-8 w-8 border-2 ${theme.border}`}>
                                        <AvatarImage src="" />
                                        <AvatarFallback className={`bg-gradient-to-br ${theme.gradient} text-white text-xs`}>
                                            {profile?.name?.substring(0, 2).toUpperCase() || 'US'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-xs font-black uppercase tracking-widest text-foreground/90 leading-none">{profile?.name || 'Utilisateur'}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">{profile?.role}</p>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-morphism border-white/20 rounded-xl w-56 mt-2" align="end">
                                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/20" />
                                <DropdownMenuItem className={`focus:${theme.light} rounded-lg cursor-pointer`}>
                                    <User className="mr-2 h-4 w-4" /> Profil
                                </DropdownMenuItem>
                                <DropdownMenuItem className={`focus:${theme.light} rounded-lg cursor-pointer`}>
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
