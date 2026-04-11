import React, { useState } from 'react'
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
    User,
    Menu,
    X
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
import { navigationConfig } from '@/config/roleNavigation'
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'

interface PremiumDashboardLayoutProps {
    children: React.ReactNode
    activeTab?: string,
    role?: 'patient' | 'pharmacy' | 'driver' | 'doctor' | 'insurer' | 'admin' | 'visitor'
}

export const PremiumDashboardLayout = ({ children, activeTab = 'home', role = 'patient' }: PremiumDashboardLayoutProps) => {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

    // Get role-specific navigation from config
    const navItems = navigationConfig[role] || navigationConfig['visitor']


    return (
        <div className="flex h-screen overflow-hidden mesh-gradient relative">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Glass Effect */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 md:w-20 lg:w-64 flex flex-col transition-transform duration-300 backdrop-blur-2xl bg-white/95 md:bg-white/5 border-r border-slate-200 md:border-white/20 shadow-[8px_0_30px_0_rgba(31,38,135,0.07)] md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20`}>
                            <span className="text-white font-bold text-xl drop-shadow-md">{role.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="md:hidden lg:block font-bold text-xl tracking-tight text-foreground/90 drop-shadow-sm">PharmaGo</span>
                    </div>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-5 w-5 text-slate-500" />
                    </Button>
                </div>

                <nav className="flex-1 mt-8 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.path !== '#') {
                                    navigate(item.path)
                                    setIsMobileMenuOpen(false)
                                }
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
                                ? `${theme.light} ${theme.primary} shadow-md border ${theme.border} ring-1 ring-white/30 backdrop-blur-md bg-white/50`
                                : 'text-slate-600 md:text-muted-foreground hover:bg-slate-100 md:hover:bg-white/10 hover:text-foreground hover:shadow-sm'
                                }`}
                        >
                            {activeTab === item.id && (
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bg} rounded-r-full`} />
                            )}
                            <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeTab === item.id ? theme.primary : ''
                                }`} />
                            <span className="md:hidden lg:block font-bold text-xs uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 md:border-white/10">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50/10 rounded-xl transition-all group backdrop-blur-sm"
                    >
                        <LogOut className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                        <span className="md:hidden lg:block font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth bg-gradient-to-br from-gray-50/50 to-gray-100/50">
                {/* Header - Glass Top Bar */}
                <header className="flex items-center justify-between gap-2 mb-8 backdrop-blur-xl bg-white/30 p-4 rounded-3xl border border-white/40 shadow-sm sticky top-4 z-30 transition-all duration-300 hover:bg-white/40">
                    <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="h-5 w-5 text-slate-700" />
                    </Button>

                    <div className="relative flex-1 max-w-md hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-10 bg-white/30 border-white/20 focus:bg-white/50 transition-all rounded-xl"
                        />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                        <NotificationCenter />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-2 sm:gap-3 glass-card pl-2 pr-2 sm:pr-4 py-1 cursor-pointer border-white/40">
                                    <Avatar className={`h-8 w-8 border-2 ${theme.border}`}>
                                        <AvatarImage src="" />
                                        <AvatarFallback className={`bg-gradient-to-br ${theme.gradient} text-white text-xs`}>
                                            {profile?.name?.substring(0, 2).toUpperCase() || 'US'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-xs font-black uppercase tracking-widest text-foreground/90 leading-none truncate max-w-[100px]">{profile?.name || 'Utilisateur'}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter truncate max-w-[100px]">{profile?.role}</p>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-morphism border-white/20 rounded-xl w-56 mt-2 z-50" align="end">
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

