import { Activity } from "lucide-react";

export const NeuroActivityWidget = () => {
    return (
        <div className="bg-blue-600 rounded-[2rem] p-6 text-white relative overflow-hidden h-full flex flex-col justify-between shadow-lg shadow-blue-500/20 group cursor-pointer hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
            {/* Background radial gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-90"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-lg font-bold">Activité Neuro</h3>
                    <p className="text-blue-100/70 text-xs mt-1 font-medium">Suivi en temps réel</p>
                </div>
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
                    <Activity className="h-5 w-5 text-white" />
                </div>
            </div>

            <div className="relative h-32 w-full mt-auto z-10">
                {/* Simplified Chart Visual */}
                <svg className="w-full h-full text-white overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Chart Line */}
                    <path
                        d="M0 35 Q 10 30, 20 35 T 40 20 T 60 30 T 80 15 T 100 25"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                    />

                    {/* Grid Lines and Labels - simplified */}
                    <line x1="20" y1="0" x2="20" y2="40" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.2" />
                    <line x1="50" y1="0" x2="50" y2="40" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.2" />
                    <line x1="80" y1="0" x2="80" y2="40" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.2" />

                    {/* Fill area */}
                    <path
                        d="M0 35 Q 10 30, 20 35 T 40 20 T 60 30 T 80 15 T 100 25 V 50 H 0 Z"
                        fill="url(#gradient)"
                        opacity="0.3"
                    />

                    {/* Active Point */}
                    <circle cx="50" cy="30" r="3" fill="white" className="animate-pulse" />
                    <circle cx="50" cy="30" r="8" stroke="white" strokeWidth="1" opacity="0.3" className="animate-ping" />
                </svg>
            </div>

            <div className="flex justify-between items-center text-xs text-blue-100/60 mt-4 relative z-10 font-medium px-2">
                <span>02</span>
                <span>03</span>
                <span>04</span>
                <span className="font-bold text-blue-600 bg-white shadow-lg shadow-white/20 p-1 rounded-md px-2 transform -translate-y-1">05</span>
                <span>06</span>
                <span>07</span>
                <span>08</span>
            </div>
        </div>
    );
};
