import { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScrollRevealProps {
    children: ReactNode;
    animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'flip';
    delay?: number;
    duration?: number;
    threshold?: number;
    className?: string;
}

const ScrollReveal = ({
    children,
    animation = 'fade-up',
    delay = 0,
    duration = 0.6,
    threshold = 0.1,
    className = ''
}: ScrollRevealProps) => {
    const { ref, isVisible } = useScrollReveal({ threshold, triggerOnce: true });

    const animationClasses = {
        'fade-up': 'translate-y-10 opacity-0',
        'fade-down': '-translate-y-10 opacity-0',
        'fade-left': 'translate-x-10 opacity-0',
        'fade-right': '-translate-x-10 opacity-0',
        'zoom-in': 'scale-95 opacity-0',
        'flip': 'rotate-x-90 opacity-0'
    };

    const visibleClasses = 'translate-y-0 translate-x-0 opacity-100 scale-100 rotate-x-0';

    return (
        <div
            ref={ref}
            className={`transition-all ease-out ${className} ${isVisible ? visibleClasses : animationClasses[animation]
                }`}
            style={{
                transitionDuration: `${duration}s`,
                transitionDelay: `${delay}s`
            }}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
