import React from 'react';

const DNABackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-900/5">
            <div className="dna-container">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="dna-strand" style={{ animationDelay: `${i * -0.2}s` }}></div>
                ))}
            </div>

            <style>
                {`
                .dna-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 100%;
                    height: 100%;
                    transform: translate(-50%, -50%) rotate(45deg) scale(1.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    opacity: 0.1;
                }

                .dna-strand {
                    position: relative;
                    width: 2px;
                    height: 120px;
                    background: linear-gradient(to bottom, transparent, #3b82f6, #8b5cf6, transparent);
                    margin: 0 15px;
                    animation: rotate 4s infinite ease-in-out;
                }

                .dna-strand::before,
                .dna-strand::after {
                    content: '';
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #60a5fa;
                    left: 50%;
                    transform: translateX(-50%);
                    box-shadow: 0 0 10px #3b82f6;
                }

                .dna-strand::before {
                    top: 0;
                    animation: particleY 4s infinite ease-in-out reverse;
                }

                .dna-strand::after {
                    bottom: 0;
                    animation: particleY 4s infinite ease-in-out;
                }

                @keyframes rotate {
                    0%, 100% { transform: scaleY(1); opacity: 0.3; }
                    50% { transform: scaleY(0.5); opacity: 0.8; }
                }

                @keyframes particleY {
                    0%, 100% { transform: translateX(-50%) scale(1); }
                    50% { transform: translateX(-50%) scale(0.5); }
                }
                `}
            </style>
        </div>
    );
};

export default DNABackground;
