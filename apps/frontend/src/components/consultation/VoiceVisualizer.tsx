import { useEffect, useState } from 'react';

const VoiceVisualizer = ({ isActive }: { isActive: boolean }) => {
    return (
        <div className={`w-full h-16 flex items-center justify-center gap-1 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-purple-500 via-pink-500 to-blue-500 rounded-full animate-wave"
                    style={{
                        height: '20%',
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1s',
                        animationPlayState: isActive ? 'running' : 'paused'
                    }}
                />
            ))}
            <style>
                {`
                @keyframes wave {
                    0%, 100% { height: 20%; opacity: 0.5; }
                    50% { height: 100%; opacity: 1; box-shadow: 0 0 10px #ec4899; }
                }
                .animate-wave {
                    animation: wave 1s ease-in-out infinite;
                }
                `}
            </style>
        </div>
    );
};

export default VoiceVisualizer;
