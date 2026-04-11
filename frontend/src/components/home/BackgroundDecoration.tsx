import { motion } from "framer-motion";

const BackgroundDecoration = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background">
            {/* 1. Mesh Gradient Base */}
            <div className="absolute inset-0 mesh-gradient opacity-60" />

            {/* 2. Pulsing Blobs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full mix-blend-multiply"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-multiply"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        x: [0, 50, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full mix-blend-multiply"
                />
            </div>

            {/* 3. Dotted Grid Overlay */}
            <div
                className="absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary) / 0.15) 1.5px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }}
            />

            {/* 4. Soft Noise Texture (Optional but adds premium feel) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

export default BackgroundDecoration;
