
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Calendar, TrendingUp, Download, ChevronRight } from "lucide-react";

interface DriverCompensationModalProps {
    isOpen: boolean;
    onClose: () => void;
    weeklyEarnings: number;
}

export const DriverCompensationModal = ({ isOpen, onClose, weeklyEarnings }: DriverCompensationModalProps) => {
    const transactions = [
        { id: "TRX-101", date: "Aujourd'hui, 14:30", type: "Livraison", amount: 1500, status: "completed" },
        { id: "TRX-098", date: "Aujourd'hui, 11:15", type: "Livraison", amount: 1500, status: "completed" },
        { id: "TRX-095", date: "Hier, 18:45", type: "Livraison", amount: 1500, status: "completed" },
        { id: "TRX-092", date: "Hier, 16:20", type: "Livraison", amount: 1500, status: "completed" },
        { id: "TRX-088", date: "Hier, 14:10", type: "Livraison + Pourboire", amount: 2000, status: "completed" },
        { id: "BONUS-01", date: "Lun, 09:00", type: "Bonus Hebdo", amount: 5000, status: "completed" },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase text-foreground">
                        <DollarSign className="h-6 w-6 text-green-600" />
                        Mes Revenus
                    </DialogTitle>
                    <DialogDescription>
                        Détail de vos gains et virements
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Total Card */}
                    <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <p className="text-green-100 font-medium uppercase tracking-widest text-xs mb-1">Solde disponible</p>
                        <h2 className="text-4xl font-black tracking-tight">{weeklyEarnings.toLocaleString()} FCFA</h2>
                        <div className="mt-4 flex gap-2">
                            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                                <Download className="h-4 w-4 mr-2" /> Retirer
                            </Button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-xl border">
                            <p className="text-xs text-muted-foreground uppercase font-bold">Cette semaine</p>
                            <p className="text-lg font-black text-foreground flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-500" /> +12.5%
                            </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border">
                            <p className="text-xs text-muted-foreground uppercase font-bold">Courses</p>
                            <p className="text-lg font-black text-foreground">42</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Transaction List */}
                    <div>
                        <h4 className="font-bold text-sm uppercase text-muted-foreground mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Historique récent
                        </h4>
                        <ScrollArea className="h-[200px] pr-4">
                            <div className="space-y-3">
                                {transactions.map((trx) => (
                                    <div key={trx.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">
                                                IN
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{trx.type}</p>
                                                <p className="text-[10px] text-muted-foreground">{trx.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-700">+{trx.amount.toLocaleString()} F</p>
                                            <Badge variant="outline" className="text-[9px] h-4 px-1 text-gray-400 font-normal uppercase border-gray-200">
                                                {trx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <Button variant="ghost" className="w-full text-xs text-muted-foreground mt-2">
                            Voir tout l'historique <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
