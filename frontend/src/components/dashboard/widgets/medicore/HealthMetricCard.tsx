import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface HealthMetricCardProps {
    title: string;
    value: string | number;
    unit?: string;
    subtitle?: string; // For secondary values
    icon?: LucideIcon;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    className?: string;
    chartType?: "wave" | "line" | "bar" | "gauge";
    chartColor?: string; // Tailwind text color class, e.g., "text-blue-500"
}

export const HealthMetricCard = ({
    title,
    value,
    unit,
    subtitle,
    icon: Icon,
    className,
    chartType = "wave",
    chartColor = "text-blue-500",
}: HealthMetricCardProps) => {
    return (
        <Card className={cn("bg-white border-0 shadow-sm rounded-3xl overflow-hidden relative", className)}>
            <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        {Icon && <Icon className="h-4 w-4" />}
                        <span className="text-sm font-medium opacity-80">{title}</span>
                    </div>
                </div>

                <div className="mt-auto relative">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900 tracking-tight">{value}</span>
                        {unit && <span className="text-sm text-gray-500 font-medium">{unit}</span>}
                    </div>
                    {subtitle && (
                        <div className="text-xs text-gray-400 font-medium mt-1">
                            {subtitle}
                        </div>
                    )}
                </div>

                {/* Visual decoration / chart placeholder */}
                <div className="absolute bottom-2 right-2 w-28 h-12 opacity-80 pointer-events-none">
                    {chartType === 'wave' && (
                        <svg viewBox="0 0 100 40" className={cn("w-full h-full", chartColor)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <path d="M0 20 Q 15 5, 30 20 T 60 20 T 90 20 T 100 20" />
                        </svg>
                    )}
                    {chartType === 'line' && (
                        <svg viewBox="0 0 100 40" className={cn("w-full h-full", chartColor)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M0 30 L 20 25 L 40 32 L 60 10 L 80 20 L 100 5" />
                        </svg>
                    )}
                    {chartType === 'bar' && (
                        <div className="flex items-end justify-end gap-1 h-full w-full">
                            <div className={cn("w-2 rounded-full opacity-30 h-[40%]", chartColor.replace('text-', 'bg-'))}></div>
                            <div className={cn("w-2 rounded-full opacity-50 h-[70%]", chartColor.replace('text-', 'bg-'))}></div>
                            <div className={cn("w-2 rounded-full h-[50%]", chartColor.replace('text-', 'bg-'))}></div>
                            <div className={cn("w-2 rounded-full opacity-60 h-[80%]", chartColor.replace('text-', 'bg-'))}></div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
