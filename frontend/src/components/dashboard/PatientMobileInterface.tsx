import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/contexts/CartContext'
import { useBiometricsContext } from '@/contexts/BiometricsContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
    Search,
    Bell,
    Heart,
    Star,
    ArrowLeft,
    Plus,
    Minus,
    Home,
    ShoppingCart,
    Settings,
    User,
    Trash2,
    MoreVertical,
    Fingerprint,
    Shield,
    LogOut,
    ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

interface Product {
    id: string
    name: string
    category: string
    price: number
    image: string
    rating: number
    description: string
    capsules: number
    discount?: number
    inStock?: boolean
}

interface CartItem extends Product {
    quantity: number
}

type Screen = 'home' | 'product' | 'checkout' | 'settings'

export const PatientMobileInterface = () => {
    const { user, profile, signOut } = useAuth()
    const navigate = useNavigate()
    const { items: cartItems, addToCart, removeFromCart, updateQuantity, getTotalPrice } = useCart()
    const { isAvailable, isEnabled, enableBiometrics, disableBiometrics } = useBiometricsContext()

    const [currentScreen, setCurrentScreen] = useState<Screen>('home')
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    // Fetch Medicines from Supabase
    useEffect(() => {
        const fetchMedicines = async () => {
            setLoading(true)
            try {
                let query = supabase
                    .from('medicines')
                    .select('*')

                if (searchQuery) {
                    query = query.ilike('name', `%${searchQuery}%`)
                }

                const { data, error } = await query.limit(20)

                if (error) throw error

                // Transform to Product interface
                const formattedProducts = data.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    category: m.category || 'Medicine',
                    price: m.price || 1500 + Math.floor(Math.random() * 5000), // Fallback if no price
                    image: '',
                    rating: 4.5 + Math.random() * 0.5,
                    description: m.description || 'No description available',
                    capsules: m.stock_quantity || 30, // Use stock_quantity if available, else mock
                    discount: Math.random() > 0.7 ? 10 : 0,
                    inStock: (m.stock_quantity > 0) || Math.random() > 0.2 // Mock stock status if no real column yet
                }))
                setProducts(formattedProducts)
            } catch (error) {
                console.error('Error fetching medicines:', error)
                toast.error("Erreur de chargement des médicaments")
            } finally {
                setLoading(false)
            }
        }

        // Debounce search
        const timer = setTimeout(() => {
            fetchMedicines()
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleAddToCart = (product: Product) => {
        addToCart({
            medicine: {
                id: product.id,
                name: product.name,
                // @ts-ignore - aligning types
                description: product.description,
                category: product.category,
                // price removed here
                requires_prescription: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            quantity: 1,
            pharmacy_id: 'pharma-1', // Default mock pharmacy for now
            pharmacy_name: 'Pharmacie Principale',
            price: product.price
        })
        toast.success("Produit ajouté au panier")
    }

    const handleCheckout = () => {
        navigate('/paiement')
    }

    const viewProduct = (product: Product) => {
        setSelectedProduct(product)
        setCurrentScreen('product')
    }

    const handleBiometricToggle = async (checked: boolean) => {
        if (checked) {
            await enableBiometrics()
        } else {
            disableBiometrics()
        }
    }

    const categories = [
        { id: 'health', name: 'Health', icon: '❤️', color: 'bg-red-100' },
        { id: 'bandage', name: 'Bandage', icon: '🩹', color: 'bg-orange-100' },
        { id: 'medicine', name: 'Medicine', icon: '💊', color: 'bg-blue-100' },
        { id: 'vitamin', name: 'Vitamin', icon: '🍊', color: 'bg-yellow-100' },
        { id: 'multivit', name: 'Multivit', icon: '🧪', color: 'bg-green-100' }
    ]

    // Navigation Bar Component
    const BottomNav = () => (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg pb-safe z-50">
            <div className="max-w-md mx-auto flex items-center justify-around py-4 px-6">
                <button
                    className={`flex flex-col items-center gap-1 ${currentScreen === 'home' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => setCurrentScreen('home')}
                >
                    <div className={`${currentScreen === 'home' ? 'bg-blue-600 text-white p-2.5 rounded-xl' : ''}`}>
                        <Home className="h-5 w-5" />
                    </div>
                </button>
                <button
                    className={`flex flex-col items-center gap-1 ${currentScreen === 'settings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => setCurrentScreen('settings')}
                >
                    <div className={`${currentScreen === 'settings' ? 'bg-blue-600 text-white p-2.5 rounded-xl' : ''}`}>
                        <User className="h-5 w-5" />
                    </div>
                </button>
                <button
                    onClick={() => setCurrentScreen('checkout')}
                    className={`flex flex-col items-center gap-1 ${currentScreen === 'checkout' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'} relative`}
                >
                    <div className={`${currentScreen === 'checkout' ? 'bg-blue-600 text-white p-2.5 rounded-xl' : ''}`}>
                        <ShoppingCart className="h-5 w-5" />
                    </div>
                    {cartItems.length > 0 && currentScreen !== 'checkout' && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                            {cartItems.length}
                        </span>
                    )}
                </button>
            </div>
        </div>
    )

    // Home Screen
    if (currentScreen === 'home') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-24">
                {/* Mobile Container */}
                <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md min-h-screen shadow-2xl">
                    {/* Header */}
                    <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-6">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-lg cursor-pointer" onClick={() => setCurrentScreen('settings')}>
                                <AvatarImage src={profile?.avatar_url || ''} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                                    {profile?.name?.charAt(0) || 'P'}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-600">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <button className="relative" onClick={() => setCurrentScreen('checkout')}>
                                <ShoppingCart className="h-6 w-6 text-slate-700" />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                                        {cartItems.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-1">Bonjour, {profile?.name?.split(' ')[0] || 'Patient'}</h1>
                            <p className="text-lg text-slate-600">Trouvez vos médicaments</p>
                        </div>

                        {/* Search Bar */}
                        <div className="mt-6 relative">
                            <Input
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-4 pr-12 h-12 bg-slate-50 border-slate-200 rounded-xl"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg">
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Catégories</h2>
                            <button className="text-sm text-blue-600 font-semibold" onClick={() => navigate('/medicaments')}>Voir tout</button>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    className={`flex flex-col items-center gap-2 min-w-[70px] ${category.id === 'medicine' ? 'bg-blue-500 text-white' : 'bg-white text-slate-700'
                                        } p-3 rounded-2xl shadow-sm hover:shadow-md transition-all`}
                                >
                                    <span className="text-2xl">{category.icon}</span>
                                    <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Best Products */}
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Populaires</h2>
                            <button className="text-sm text-blue-600 font-semibold" onClick={() => navigate('/medicaments')}>Voir tout</button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {products.map((product) => (
                                    <Card
                                        key={product.id}
                                        className="bg-white border-slate-200 hover:shadow-lg transition-all cursor-pointer"
                                        onClick={() => viewProduct(product)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex gap-2">
                                                    {product.discount > 0 && (
                                                        <Badge className="bg-green-100 text-green-700 text-xs font-bold">
                                                            -{product.discount}%
                                                        </Badge>
                                                    )}
                                                    {product.inStock === false && (
                                                        <Badge className="bg-red-100 text-red-700 text-xs font-bold">
                                                            Rupture
                                                        </Badge>
                                                    )}
                                                </div>
                                                <button className="text-slate-400 hover:text-red-500">
                                                    <Heart className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-xl mb-3 flex items-center justify-center">
                                                <div className="text-4xl">💊</div>
                                            </div>

                                            <h3 className="font-bold text-sm text-slate-900 mb-1 line-clamp-2">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mb-2">{product.category}</p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-slate-900">{product.price.toLocaleString()} F</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (product.inStock !== false) handleAddToCart(product)
                                                    }}
                                                    disabled={product.inStock === false}
                                                    className={`p-2 rounded-lg ${product.inStock === false ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <BottomNav />
                </div>
            </div >
        )
    }

    // Settings Screen
    if (currentScreen === 'settings') {
        return (
            <div className="min-h-screen bg-slate-50 pb-24">
                <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl">
                    <div className="p-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentScreen('home')}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <ArrowLeft className="h-6 w-6 text-slate-700" />
                            </button>
                            <h1 className="text-xl font-bold text-slate-900">Paramètres</h1>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Profile Section */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
                                <AvatarImage src={profile?.avatar_url || ''} />
                                <AvatarFallback className="bg-blue-600 text-white text-xl">
                                    {profile?.name?.charAt(0) || 'P'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-bold text-lg">{profile?.name || 'Patient'}</h2>
                                <p className="text-sm text-slate-500">{user?.email}</p>
                                <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700">Patient Vérifié</Badge>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Sécurité</h3>
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                            <Fingerprint className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Verrouillage Biométrique</p>
                                            <p className="text-xs text-slate-500">FaceID / TouchID</p>
                                        </div>
                                    </div>
                                    {isAvailable ? (
                                        <Switch
                                            checked={isEnabled}
                                            onCheckedChange={handleBiometricToggle}
                                        />
                                    ) : (
                                        <Badge variant="outline" className="text-slate-400">Non dispo</Badge>
                                    )}
                                </div>
                                <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Changer Code PIN</p>
                                            <p className="text-xs text-slate-500">Pour paiements</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Compte</h3>
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-100"
                                >
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                        <Home className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-slate-900">Tableau de bord complet</p>
                                        <p className="text-xs text-slate-500">Vue détaillée</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />
                                </button>

                                <button
                                    onClick={() => signOut()}
                                    className="w-full p-4 flex items-center gap-3 hover:bg-red-50 text-red-600 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="font-medium">Se déconnecter</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <BottomNav />
            </div>
        )
    }

    // Product Detail Screen
    if (currentScreen === 'product' && selectedProduct) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-24">
                <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md min-h-screen shadow-2xl">
                    {/* Header */}
                    <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setCurrentScreen('home')}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <ArrowLeft className="h-6 w-6 text-slate-700" />
                            </button>

                            <button className="text-slate-400 hover:text-red-500">
                                <Heart className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Product Image */}
                        <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl mb-6 flex items-center justify-center relative">
                            <div className="text-8xl">💊</div>
                            <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-bold text-slate-900">{selectedProduct.rating.toFixed(1)}</span>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold text-slate-900">{selectedProduct.name}</h1>
                            <p className="text-sm text-slate-600">{selectedProduct.capsules} Capsules</p>

                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-slate-900">{selectedProduct.price.toLocaleString()} F</span>
                                <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2">
                                    <Button
                                        onClick={() => handleAddToCart(selectedProduct)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                    >
                                        Ajouter au panier
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {selectedProduct.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <BottomNav />
            </div>
        )
    }

    // Checkout Screen (Cart View)
    if (currentScreen === 'checkout') {
        const total = getTotalPrice()
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-24">
                <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md min-h-screen shadow-2xl">
                    {/* Header */}
                    <div className="p-6 pb-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setCurrentScreen('home')}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <ArrowLeft className="h-6 w-6 text-slate-700" />
                            </button>

                            <h1 className="text-lg font-bold text-slate-900">Panier</h1>

                            <div className="w-10" /> {/* Spacer */}
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="p-6 space-y-4 min-h-[50vh]">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                Votre panier est vide
                            </div>
                        ) : cartItems.map((item) => (
                            <Card key={item.medicine.id} className="bg-white border-slate-200">
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="text-3xl">💊</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-sm text-slate-900">{item.medicine.name}</h3>
                                                    <p className="text-xs text-slate-500">{item.pharmacy_name}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.medicine.id)}
                                                    className="text-slate-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-slate-900">{(item.price * item.quantity).toLocaleString()} F</span>
                                                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
                                                    <button
                                                        onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                                                        className="text-slate-600 hover:text-slate-900"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="text-sm font-bold text-white bg-blue-600 w-6 h-6 rounded flex items-center justify-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                                                        className="text-slate-600 hover:text-slate-900"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Payment Summary */}
                    {cartItems.length > 0 && (
                        <div className="p-6 pt-0 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Total</span>
                                    <span className="text-xl font-bold text-slate-900">{total.toLocaleString()} FCFA</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-semibold"
                            >
                                Passer la commande
                            </Button>
                        </div>
                    )}
                </div>
                <BottomNav />
            </div>
        )
    }

    return null
}
