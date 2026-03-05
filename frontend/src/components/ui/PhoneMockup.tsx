import React from 'react';
import { motion } from 'framer-motion';
import { BrandLogo3D } from './BrandLogo3D';

export const PhoneMockup = () => {
    return (
        <div className="relative perspective-1000 flex items-center justify-center p-12">
            <motion.div
                initial={{ rotateY: 20, rotateX: 5, y: 0 }}
                animate={{
                    y: [-25, 25],
                    rotateY: [15, 25],
                    rotateX: [2, 8]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
                className="relative w-full max-w-[500px] preserve-3d will-change-transform flex items-center justify-center"
                style={{ backfaceVisibility: 'hidden' }}
            >
                {/* Main 3D Logo replacement for the phone */}
                <BrandLogo3D className="transform translate-z-0" />

                {/* Floating "P" Logo Badge - Now using the same consistent branding */}
                <motion.div
                    animate={{
                        y: [-15, 15],
                        rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="absolute -top-12 -left-8 w-20 h-20 bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl flex items-center justify-center p-4 border border-white/40 z-50 transition-transform"
                    style={{ transform: 'translateZ(50px)' }}
                >
                    <BrandLogo3D className="w-full h-full scale-150" />
                </motion.div>

                {/* Secondary decorative elements */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"
                />
            </motion.div>

            {/* Dynamic Shadow */}
            <motion.div
                animate={{
                    scale: [0.9, 1.2, 0.9],
                    opacity: [0.2, 0.1, 0.2]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 h-20 bg-blue-900/40 blur-[80px] rounded-[100%] z-0"
            />
        </div>
    );
};
