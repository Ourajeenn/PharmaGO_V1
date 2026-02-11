import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    MoreVertical
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
}

interface CartItem extends Product {
    quantity: number
}

type Screen = 'home' | 'product' | 'checkout'

export const PatientMobileInterface = () => {
    const { user, profile } = useAuth()
    const navigate = useNavigate()

    const [currentScreen, setCurrentScreen] = useState<Screen>('home')
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [cart, setCart] = useState<CartItem[]>([
        {
            id: '1',
            name: 'Liver cleans detox',
            category: 'Medicine',
            price: 60.99,
            image: '',
            rating: 4.9,
            description: 'Detox supplement for liver health',
            capsules: 120,
            quantity: 2
        },
        {
            id: '2',
            name: 'Vitamin Capsules',
            category: 'Vitamin',
            price: 55.99,
            image: '',
            rating: 4.8,
            description: 'Complete vitamin supplement',
            capsules: 90,
            quantity: 2
        },
        {
            id: '3',
            name: 'Covid vaccine',
            category: 'Medicine',
            price: 60.99,
            image: '',
            rating: 4.9,
            description: 'COVID-19 vaccination',
            capsules: 100,
            quantity: 2
        }
    ])
    const [searchQuery, setSearchQuery] = useState('')

    const categories = [
        { id: 'health', name: 'Health', icon: '❤️', color: 'bg-red-100' },
        { id: 'bandage', name: 'Bandage', icon: '🩹', color: 'bg-orange-100' },
        { id: 'medicine', name: 'Medicine', icon: '💊', color: 'bg-blue-100' },
        { id: 'vitamin', name: 'Vitamin', icon: '🍊', color: 'bg-yellow-100' },
        { id: 'multivit', name: 'Multivit', icon: '🧪', color: 'bg-green-100' }
    ]

    const [products] = useState<Product[]>([
        {
            id: '1',
            name: 'Biotin coconut oil',
            category: 'Medicine',
            price: 20.00,
            image: '',
            rating: 4.9,
            description: 'Natural coconut oil supplement',
            capsules: 60,
            discount: 20
        },
        {
            id: '2',
            name: 'Whey-RX',
            category: 'Medicine',
            price: 12.00,
            image: '',
            rating: 4.8,
            description: 'Protein supplement',
            capsules: 30,
            discount: 20
        },
        {
            id: '3',
            name: 'Biotin For Beauty',
            category: 'Medicine',
            price: 24.50,
            image: '',
            rating: 4.9,
            description: 'Ambrosiol Essentials Biotin is a plant-based supplement that nourishes hair, skin, and nails, boosting natural beauty, strength, vitality, and wellness',
            capsules: 60
        }
    ])

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.id === product.id)
        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setCart([...cart, { ...product, quantity: 1 }])
        }
        toast.success(`${product.name} ajouté au panier`)
    }

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item =>
            item.id === productId
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        ))
    }

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId))
        toast.success('Produit retiré du panier')
    }

    const calculateTotal = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const delivery = 60.99
        return { subtotal, delivery, total: subtotal + delivery }
    }

    const handleCheckout = () => {
        toast.success('Commande passée avec succès!')
        setCart([])
        setCurrentScreen('home')
    }

    const viewProduct = (product: Product) => {
        setSelectedProduct(product)
        setCurrentScreen('product')
    }

    const totals = calculateTotal()

    // Home Screen
    if (currentScreen === 'home') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-20">
                {/* Mobile Container */}
                <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md min-h-screen shadow-2xl">
                    {/* Header */}
                    <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-6">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                                    {profile?.name?.charAt(0) || 'P'}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-600">9:41</span>
                            </div>

                            <button className="relative">
                                <Bell className="h-6 w-6 text-yellow-500" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                                        {cart.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-1">Your Trusted</h1>
                            <p className="text-lg text-slate-600">Online Pharmacy</p>
                        </div>

                        {/* Search Bar */}
                        <div className="mt-6 relative">
                            <Input
                                placeholder="Search here..."
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
                            <h2 className="text-lg font-bold text-slate-900">Categories</h2>
                            <button className="text-sm text-blue-600 font-semibold">See All</button>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2">
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
                            <h2 className="text-lg font-bold text-slate-900">Best Products</h2>
                            <button className="text-sm text-blue-600 font-semibold">See All</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {products.map((product) => (
                                <Card
                                    key={product.id}
                                    className="bg-white border-slate-200 hover:shadow-lg transition-all cursor-pointer"
                                    onClick={() => viewProduct(product)}
                                >
                                    <CardContent className="p-4">
                                        {product.discount && (
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge className="bg-green-100 text-green-700 text-xs font-bold">
                                                    {product.discount}% OFF
                                                </Badge>
                                                <button className="text-slate-400 hover:text-red-500">
                                                    <Heart className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}

                                        <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-xl mb-3 flex items-center justify-center">
                                            <div className="text-4xl">💊</div>
                                        </div>

                                        <h3 className="font-bold text-sm text-slate-900 mb-1 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 mb-2">{product.category}</p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-slate-900">${product.price}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    addToCart(product)
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
                        <div className="max-w-md mx-auto flex items-center justify-around py-4 px-6">
                            <button className="flex flex-col items-center gap-1 text-blue-600">
                                <div className="bg-blue-600 text-white p-2.5 rounded-xl">
                                    <Home className="h-5 w-5" />
                                </div>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
                                <Heart className="h-6 w-6" />
                            </button>
                            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
                                <Settings className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => setCurrentScreen('checkout')}
                                className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 relative"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                                        {cart.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Product Detail Screen
    if (currentScreen === 'product' && selectedProduct) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
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

                            <span className="text-xs font-medium text-slate-600">9:41</span>

                            <button className="text-slate-400 hover:text-red-500">
                                <Heart className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Product Image */}
                        <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl mb-6 flex items-center justify-center relative">
                            <div className="text-8xl">💊</div>
                            <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-bold text-slate-900">{selectedProduct.rating}</span>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold text-slate-900">{selectedProduct.name}</h1>
                            <p className="text-sm text-slate-600">{selectedProduct.capsules} Capsules</p>

                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-slate-900">${selectedProduct.price}</span>
                                <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2">
                                    <button
                                        onClick={() => {
                                            const item = cart.find(i => i.id === selectedProduct.id)
                                            if (item && item.quantity > 1) {
                                                updateQuantity(selectedProduct.id, -1)
                                            }
                                        }}
                                        className="text-slate-600 hover:text-slate-900"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="text-lg font-bold text-white bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                                        {cart.find(i => i.id === selectedProduct.id)?.quantity || 2}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(selectedProduct.id, 1)}
                                        className="text-slate-600 hover:text-slate-900"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {selectedProduct.description}
                                </p>
                            </div>

                            <Button
                                onClick={() => {
                                    addToCart(selectedProduct)
                                    setCurrentScreen('checkout')
                                }}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-semibold mt-6"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add product
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Checkout Screen
    if (currentScreen === 'checkout') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
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

                            <h1 className="text-lg font-bold text-slate-900">Checkout</h1>

                            <button className="p-2 hover:bg-slate-100 rounded-lg">
                                <MoreVertical className="h-6 w-6 text-slate-700" />
                            </button>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="p-6 space-y-4">
                        {cart.map((item) => (
                            <Card key={item.id} className="bg-white border-slate-200">
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="text-3xl">💊</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                                                    <p className="text-xs text-slate-500">Size: {item.capsules} Count</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-slate-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-slate-900">${item.price}</span>
                                                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="text-slate-600 hover:text-slate-900"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="text-sm font-bold text-white bg-blue-600 w-6 h-6 rounded flex items-center justify-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
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

                        <Button
                            variant="outline"
                            className="w-full h-12 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded-2xl font-semibold"
                            onClick={() => setCurrentScreen('home')}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add product
                        </Button>
                    </div>

                    {/* Payment Summary */}
                    <div className="p-6 pt-0 space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Payment</span>
                                <span className="font-semibold text-slate-900">${totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Delivery</span>
                                <span className="font-semibold text-slate-900">${totals.delivery.toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-slate-200" />
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">Total</span>
                                <span className="text-xl font-bold text-slate-900">${totals.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50">
                            <span className="text-sm text-slate-600">Use voucher</span>
                            <Plus className="h-4 w-4 text-slate-400" />
                        </button>

                        <Button
                            onClick={handleCheckout}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-semibold"
                        >
                            Pay Now
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
