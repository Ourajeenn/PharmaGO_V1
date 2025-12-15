import { useNavigate } from "react-router-dom";
import { Video, MessageCircle, FileText, Calendar, Shield, Activity, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

const ConsultationMenu = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            icon: Video,
            title: "Vidéo",
            id: "video",
            color: "text-blue-400",
            description: "Consultez un médecin en face à face via vidéo sécurisée"
        },
        {
            icon: MessageCircle,
            title: "Chat",
            id: "chat",
            color: "text-green-400",
            description: "Échangez par message avec votre médecin"
        },
        {
            icon: FileText,
            title: "Ordonnance",
            id: "prescription",
            color: "text-purple-400",
            description: "Recevez votre ordonnance électronique directement"
        },
        {
            icon: Calendar,
            title: "Rendez-vous",
            id: "appointment",
            color: "text-pink-400",
            description: "Réservez votre consultation (Disponibilité 24/7)"
        },
        {
            icon: Activity,
            title: "E-carnet",
            id: "ecarnet",
            color: "text-yellow-400",
            description: "Votre carnet de santé électronique accessible partout"
        },
        {
            icon: Shield,
            title: "Confidentialité",
            id: "privacy",
            color: "text-cyan-400",
            description: "Vos données médicales sont sécurisées"
        }
    ];

    return (
        <div className="relative w-full max-w-[600px] aspect-square mx-auto flex items-center justify-center">
            {/* Background Dark Overlay if needed, but the container page handles background */}
            <div className="absolute inset-0 bg-black/90 rounded-full blur-3xl opacity-20 transform scale-150"></div>

            {/* Concentric Circles */}
            <div className="absolute w-[80%] h-[80%] rounded-full border border-blue-500/10 animate-[spin_60s_linear_infinite]" />
            <div className="absolute w-[60%] h-[60%] rounded-full border border-blue-500/20 animate-[spin_40s_linear_infinite_reverse]" />
            <div className="absolute w-[40%] h-[40%] rounded-full border border-blue-500/30 animate-[spin_30s_linear_infinite]" />

            {/* Glowing Center Effect */}
            <div className="absolute w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />

            {/* Center Button */}
            <div className="absolute z-20 flex items-center justify-center">
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)] border-4 border-black/50 group cursor-default transition-transform hover:scale-105 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                    <Stethoscope className="w-10 h-10 text-white animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
            </div>

            {/* Orbiting Container for Menu Items */}
            <div className="absolute inset-0 animate-[spin_60s_linear_infinite] pointer-events-none">
                {menuItems.map((item, index) => {
                    const angle = (index * 360) / menuItems.length - 90; // Start from top (-90deg)

                    return (
                        <div
                            key={item.id}
                            className="absolute z-20 pointer-events-auto -ml-10 -mt-10"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `rotate(${angle}deg) translate(${180}px) rotate(${-angle}deg)` // Fixed pixel translation for better control on desktop
                            }}
                        >
                            {/* Counter-rotate the button content so it stays upright while orbiting */}
                            <div className="animate-[spin_60s_linear_infinite_reverse] group relative">
                                <button
                                    onClick={() => navigate(`/consultation/${item.id}`)}
                                    className={cn(
                                        "flex flex-col items-center justify-center w-20 h-20 rounded-2xl",
                                        "bg-zinc-900/90 border border-white/10 shadow-lg backdrop-blur-sm",
                                        "hover:scale-110 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
                                        "transition-all duration-300 ease-out"
                                    )}
                                >
                                    <item.icon className={cn("w-8 h-8 mb-2 transition-colors", item.color, "group-hover:text-blue-400")} />
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 group-hover:text-white font-medium">
                                        {item.title}
                                    </span>
                                </button>

                                {/* Info Popup */}
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-6 w-48 bg-zinc-900/95 border border-white/10 p-4 rounded-xl shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none z-50 invisible group-hover:visible">
                                    <h4 className={cn("font-semibold mb-1 text-sm", item.color)}>{item.title}</h4>
                                    <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>

                                    {/* Arrow */}
                                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
                                </div>
                            </div>

                            {/* Connector Line (Decorative) */}
                            <div
                                className="absolute top-1/2 left-1/2 w-[100px] h-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 -z-10 origin-left"
                                style={{
                                    transform: `rotate(${angle + 180}deg)`,
                                    width: '140px',
                                    left: '50%',
                                    top: '50%',
                                    marginLeft: '-70px'
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConsultationMenu;
