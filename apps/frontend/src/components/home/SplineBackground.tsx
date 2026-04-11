import React from 'react';

const SplineBackground = () => {
    return (
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden select-none hidden md:block">
            <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px] z-0" />
            <iframe
                src="https://my.spline.design/celestialflowabstractdigitalform-ObUlVgj70g2y4bbx5vBKSfxN/"
                frameBorder="0"
                width="100%"
                height="100%"
                id="aura-spline"
                className="w-full h-full opacity-60 scale-110"
                title="Spline Background Illustration"
                loading="lazy"
            />
            {/* Overlay to ensure readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background/80 pointer-events-none" />
        </div>
    );
};

export default SplineBackground;
