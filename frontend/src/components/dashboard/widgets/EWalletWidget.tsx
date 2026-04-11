import { Wallet, Smartphone, History, PlusCircle, CreditCard, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const EWalletWidget = () => {
    return (
        <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 border-none shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors duration-500"></div>

            <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                            <Wallet className="h-5 w-5 text-purple-200" />
                        </div>
                        <span className="font-bold text-purple-100 tracking-wide text-sm">Mon Portefeuille</span>
                    </div>
                    <Button variant="ghost" className="h-8 w-8 rounded-full p-0 bg-white/10 hover:bg-white/20 text-white">
                        <History className="h-4 w-4" />
                    </Button>
                </div>

                <div className="mb-8">
                    <p className="text-purple-200 text-xs font-medium uppercase tracking-wider mb-1">Solde Disponible</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-4xl font-black tracking-tight">25 500</h3>
                        <span className="text-lg font-bold text-purple-300">FCFA</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button className="bg-white text-indigo-900 hover:bg-purple-50 hover:scale-[1.02] transition-all font-bold rounded-xl h-12 shadow-lg shadow-white/10">
                        <PlusCircle className="h-4 w-4 mr-2" /> Recharger
                    </Button>
                    <Button variant="outline" className="glass-morphism border-white/20 text-white hover:bg-white/10 font-bold rounded-xl h-12">
                        <CreditCard className="h-4 w-4 mr-2" /> Cartes
                    </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center border-2 border-indigo-900 text-[8px] font-bold">OM</div>
                            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-indigo-900 text-[8px] font-bold text-black">MTN</div>
                            <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center border-2 border-indigo-900 text-[8px] font-bold">W</div>
                        </div>
                        <div className="flex items-center gap-2 text-purple-200 hover:text-white cursor-pointer transition-colors">
                            <span className="text-xs font-bold">Gérer les comptes</span>
                            <ArrowRight className="h-3 w-3" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
