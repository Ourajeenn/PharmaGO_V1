import { motion } from 'framer-motion';

export const BrandLogo3D = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <motion.div
                className="relative w-64 h-64 md:w-80 md:h-80"
                style={{ perspective: '1000px' }}
            >
                {/* Image Logo */}
                <img
                    src="/pharmago-mobile-transparent.png"
                    alt="PharmaGo Logo"
                    className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(14,165,233,0.3)] filter"
                />

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
