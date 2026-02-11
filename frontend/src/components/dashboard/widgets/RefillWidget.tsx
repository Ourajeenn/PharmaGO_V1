import { RefreshCw, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

export const RefillWidget = () => {
    const navigate = useNavigate();

    // Mock data for the widget
    const nextRefill = {
        medication: 'Metformine 500mg',
        date: '15 Fév',
        daysLeft: 5,
        refillsLeft: 2,
        totalRefills: 6
    };

    return (
        <div className="glass-card p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                    <h4 className="font-bold">Renouvellement Rapide</h4>
                    <p className="text-xs text-muted-foreground">Ordonnance récurrente</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-3 bg-white/40 rounded-xl border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h5 className="font-bold text-sm">{nextRefill.medication}</h5>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Clock className="h-3 w-3" />
                                Dû le {nextRefill.date}
                            </div>
                        </div>
                        <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                            J-{nextRefill.daysLeft}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Progression</span>
                            <span>{nextRefill.refillsLeft}/{nextRefill.totalRefills} restants</span>
                        </div>
                        <Progress value={(nextRefill.refillsLeft / nextRefill.totalRefills) * 100} className="h-1.5 bg-purple-100" />
                    </div>
                </div>

                <Button
                    onClick={() => navigate('/ordonnances')}
                    className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
                >
                    Commander maintenant <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
};
