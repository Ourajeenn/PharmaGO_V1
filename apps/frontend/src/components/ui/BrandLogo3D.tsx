import { motion } from 'framer-motion';

export const BrandLogo3D = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <motion.div
                className="relative w-64 h-64 md:w-80 md:h-80"
                style={{ perspective: '1000px' }}
            >
                {/* SVG Logo with 3D layers */}
                <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full drop-shadow-[0_20px_50px_rgba(14,165,233,0.3)] filter"
                >
                    <defs>
                        <linearGradient id="pGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#0EA5E9', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
                        </linearGradient>

                        <linearGradient id="pGradientGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.4)', stopOpacity: 0.5 }} />
                            <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 0 }} />
                        </linearGradient>

                        <filter id="glass" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                        </filter>
                    </defs>

                    {/* Background Glow Layer */}
                    <motion.circle
                        cx="100" cy="100" r="80"
                        fill="rgba(14,165,233,0.05)"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Main Stylized "P" */}
                    <motion.path
                        d="M60 40 V160 M60 40 H110 C140 40 140 100 110 100 H60"
                        stroke="url(#pGradient)"
                        strokeWidth="24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Capsule/Pill Detail on the Stem */}
                    <motion.rect
                        x="52" y="30" width="16" height="40" rx="8"
                        fill="white"
                        opacity="0.3"
                        style={{ filter: 'url(#glass)' }}
                        animate={{ y: [30, 130, 30] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Inner highlight for 3D effect */}
                    <motion.path
                        d="M72 52 V148 M72 52 H100 C120 52 120 88 100 88 H72"
                        stroke="url(#pGradientGlow)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        fill="none"
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Cross icon detail (linking to pharmacy) */}
                    <motion.path
                        d="M140 140 H160 M150 130 V150"
                        stroke="#10B981"
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                    />
                </svg>

                {/* Floating particles around the logo */}
                <motion.div
                    className="absolute top-0 right-0 w-8 h-8 bg-blue-400/20 rounded-full blur-xl"
                    animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-10 left-0 w-12 h-12 bg-emerald-400/10 rounded-full blur-xl"
                    animate={{ x: [0, -40, 0], y: [0, 20, 0] }}
                    transition={{ duration: 7, repeat: Infinity }}
                />
            </motion.div>
        </div>
    );
};
