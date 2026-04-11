import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

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
    data?: any[]; // Array of values { value: number, measured_at: string }
    status?: "danger" | "warning" | "success" | "neutral";
    alertMessage?: string;
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
    data = [],
    status = "neutral",
    alertMessage,
}: HealthMetricCardProps) => {
    // Determine the hex color from Tailwind class for Recharts
    const getHexColor = (twClass: string) => {
        if (status === 'danger') return '#ef4444';
        if (status === 'warning') return '#f59e0b';
        if (twClass.includes('blue')) return '#3b82f6';
        if (twClass.includes('indigo')) return '#6366f1';
        if (twClass.includes('cyan')) return '#06b6d4';
        if (twClass.includes('emerald')) return '#10b981';
        return '#3b82f6';
    };

    const color = getHexColor(chartColor);

    return (
        <Card className={cn(
            "bg-white border transition-all duration-300 shadow-sm rounded-3xl overflow-hidden relative",
            status === 'danger' ? 'border-red-200 shadow-red-50' :
                status === 'warning' ? 'border-amber-200 shadow-amber-50' :
                    'border-0',
            className
        )}>
            <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        {Icon && <Icon className={cn("h-4 w-4", status === 'danger' ? 'text-red-500' : status === 'warning' ? 'text-amber-500' : '')} />}
                        <span className="text-sm font-medium opacity-80">{title}</span>
                    </div>
                    {status !== 'neutral' && (
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            status === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        )}>
                            {status === 'danger' ? 'Alerte' : 'Attention'}
                        </div>
                    )}
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
                <div className="absolute bottom-0 right-0 left-0 h-16 opacity-40 pointer-events-none overflow-hidden rounded-b-3xl">
                    {data && data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'bar' ? (
                                <BarChart data={data}>
                                    <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            ) : (
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={color}
                                        fillOpacity={1}
                                        fill={`url(#color-${title})`}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    ) : (
                        <div className="absolute bottom-2 right-2 w-28 h-12 opacity-80">
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
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
