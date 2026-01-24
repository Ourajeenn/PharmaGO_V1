import { useCallback } from "react";
import type { Container, Engine } from "tsparticles-engine";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const NetworkBackground = () => {
    const particlesInit = useCallback(async (engine: any) => {
        await loadFull(engine);
    }, []);

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        // await console.log(container);
    }, []);

    // Simple mobile detection to disable particles for performance
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (isMobile) return null;

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            className="absolute inset-0 -z-10 bg-black" // Added black background to make the orange pop like the reference
            options={{
                fullScreen: { enable: false },
                background: {
                    color: {
                        value: "#000000", // Explicit black background
                    },
                },
                fpsLimit: 120,
                particles: {
                    color: {
                        value: ["#fbbf24", "#f59e0b", "#ea580c", "#ffffff"], // Gold, Orange, Red-Orange, White core
                    },
                    links: {
                        enable: false,
                    },
                    move: {
                        direction: "top", // Vertical flux
                        enable: true,
                        outModes: {
                            default: "destroy",
                        },
                        random: false,
                        speed: 3, // Faster upward speed
                        straight: false, // Slight wave
                        trail: {
                            enable: true,
                            length: 5,
                            fill: {
                                color: "#000000",
                            },
                        },
                        warp: true,
                    },
                    number: {
                        value: 0,
                    },
                    opacity: {
                        value: { min: 0.1, max: 0.8 },
                        animation: {
                            enable: true,
                            speed: 1,
                            sync: false,
                        },
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 3 },
                    },
                },
                emitters: {
                    direction: "top",
                    life: {
                        count: 0,
                        duration: 0.1,
                        delay: 0.1,
                    },
                    rate: {
                        delay: 0.05, // High fire rate
                        quantity: 2,
                    },
                    size: {
                        mode: "percent",
                        width: 20, // Narrow beam width (20% of screen)
                        height: 0,
                    },
                    position: {
                        x: 50, // Center X
                        y: 100, // Bottom Y
                    },
                },
            }}
        />
    );
};

export default NetworkBackground;
