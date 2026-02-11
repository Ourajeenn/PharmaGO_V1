import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Smartphone,
    History,
    Shield,
    Sparkles,
    ChevronRight,
    QrCode
} from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
}

interface EWalletProps {
    userId?: string;
}

export function EWallet({ userId }: EWalletProps) {
    const [balance, setBalance] = useState(25000);
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: '1', type: 'credit', amount: 15000, description: 'Recharge Orange Money', date: '2026-02-07', status: 'completed' },
        { id: '2', type: 'debit', amount: 5500, description: 'Commande #PG-2456', date: '2026-02-06', status: 'completed' },
        { id: '3', type: 'credit', amount: 10000, description: 'Remboursement CMU', date: '2026-02-05', status: 'completed' },
        { id: '4', type: 'debit', amount: 3200, description: 'Commande #PG-2421', date: '2026-02-04', status: 'completed' },
        { id: '5', type: 'credit', amount: 5000, description: 'Bonus fidélité', date: '2026-02-03', status: 'completed' },
    ]);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [topUpMethod, setTopUpMethod] = useState<'orange' | 'mtn' | 'wave' | 'card'>('orange');

    const handleTopUp = () => {
        const amount = parseInt(topUpAmount);
        if (isNaN(amount) || amount < 500) {
            toast.error('Montant minimum: 500 FCFA');
            return;
        }

        // Simulate top-up
        setBalance(prev => prev + amount);
        setTransactions(prev => [{
            id: `tx-${Date.now()}`,
            type: 'credit',
            amount,
            description: `Recharge ${topUpMethod === 'orange' ? 'Orange Money' : topUpMethod === 'mtn' ? 'MTN Money' : topUpMethod === 'wave' ? 'Wave' : 'Carte bancaire'}`,
            date: new Date().toISOString().split('T')[0],
            status: 'completed'
        }, ...prev]);

        toast.success(`+${amount.toLocaleString()} FCFA ajoutés à votre portefeuille`);
        setIsTopUpOpen(false);
        setTopUpAmount('');
    };

    const quickAmounts = [5000, 10000, 25000, 50000];

    return (
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-purple-500/10 border-primary/20 overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Mon Portefeuille</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Sécurisé
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Balance Display */}
                <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <p className="text-sm text-white/70 font-medium">Solde disponible</p>
                    <h2 className="text-4xl font-black mt-1">
                        {balance.toLocaleString()} <span className="text-lg font-normal">FCFA</span>
                    </h2>

                    <div className="flex items-center gap-3 mt-4">
                        <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" aria-label="Recharger le portefeuille">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Recharger
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5 text-primary" />
                                        Recharger mon portefeuille
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    {/* Quick Amounts */}
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Montant rapide</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {quickAmounts.map(amount => (
                                                <Button
                                                    key={amount}
                                                    variant={topUpAmount === amount.toString() ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setTopUpAmount(amount.toString())}
                                                >
                                                    {(amount / 1000)}k
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Amount */}
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Ou montant personnalisé</p>
                                        <Input
                                            type="number"
                                            placeholder="Montant en FCFA"
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(e.target.value)}
                                        />
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Mode de paiement</p>
                                        <Tabs value={topUpMethod} onValueChange={(v) => setTopUpMethod(v as any)}>
                                            <TabsList className="grid grid-cols-4 w-full">
                                                <TabsTrigger value="orange" className="text-xs">
                                                    🟠 Orange
                                                </TabsTrigger>
                                                <TabsTrigger value="mtn" className="text-xs">
                                                    🟡 MTN
                                                </TabsTrigger>
                                                <TabsTrigger value="wave" className="text-xs">
                                                    🔵 Wave
                                                </TabsTrigger>
                                                <TabsTrigger value="card" className="text-xs">
                                                    💳 Carte
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>

                                    <Button onClick={handleTopUp} className="w-full" size="lg">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Recharger {topUpAmount && `${parseInt(topUpAmount).toLocaleString()} FCFA`}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" aria-label="Afficher mon code QR">
                            <QrCode className="h-4 w-4 mr-1" />
                            Mon QR
                        </Button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="flex-col h-auto py-3" aria-label="Envoyer de l'argent">
                        <ArrowUpRight className="h-4 w-4 text-green-600 mb-1" />
                        <span className="text-xs">Envoyer</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-col h-auto py-3" aria-label="Recevoir de l'argent">
                        <ArrowDownLeft className="h-4 w-4 text-blue-600 mb-1" />
                        <span className="text-xs">Recevoir</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-col h-auto py-3" aria-label="Voir l'historique des transactions">
                        <History className="h-4 w-4 text-purple-600 mb-1" />
                        <span className="text-xs">Historique</span>
                    </Button>
                </div>

                {/* Recent Transactions */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold">Transactions récentes</h4>
                        <Button variant="ghost" size="sm" className="text-xs text-primary">
                            Voir tout <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {transactions.slice(0, 4).map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {tx.type === 'credit' ? (
                                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{tx.description}</p>
                                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()} F
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Promo Banner */}
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/50 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Sparkles className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-800">Bonus fidélité actif</p>
                        <p className="text-xs text-amber-600">+5% sur chaque recharge ce mois</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-amber-600" />
                </div>
            </CardContent>
        </Card>
    );
}
