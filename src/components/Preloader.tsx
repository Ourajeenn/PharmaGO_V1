export default function Preloader() {
  return (
    <div role="status" aria-live="polite" className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-orange-50 via-white to-purple-50 relative overflow-hidden">

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-secondary rounded-full animate-float-delayed" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent rounded-full animate-float" />
      </div>

      {/* Main delivery animation container */}
      <div className="relative w-full max-w-md h-64">

        {/* Road/path */}
        <div className="absolute bottom-20 left-0 right-0 h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full" />
        <div className="absolute bottom-20 left-0 right-0 h-1 bg-white/50 animate-road-lines" />

        {/* Delivery scooter with package */}
        <div className="absolute bottom-16 left-0 w-full animate-delivery-move">
          <div className="relative w-24 h-24 mx-auto">
            {/* Scooter body */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              {/* Package on scooter */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-lg animate-bounce-package">
                <div className="absolute top-1 left-1 right-1 h-1 bg-white/30 rounded" />
                <div className="absolute top-1 bottom-1 left-1/2 -translate-x-1/2 w-1 bg-white/30 rounded" />
                {/* Cross sign on package */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">+</div>
              </div>

              {/* Scooter icon simplified */}
              <svg width="60" height="40" viewBox="0 0 60 40" fill="none" className="drop-shadow-lg">
                {/* Scooter body */}
                <path d="M10 25 L35 25 L40 15 L30 15 L25 20 Z" fill="#3b82f6" stroke="#1e40af" strokeWidth="1.5" />
                {/* Seat */}
                <rect x="22" y="18" width="8" height="4" rx="2" fill="#1e40af" />
                {/* Handlebar */}
                <path d="M38 15 L42 10 L45 10" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" />
                {/* Front wheel */}
                <circle cx="40" cy="30" r="6" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
                <circle cx="40" cy="30" r="3" fill="#6b7280" />
                {/* Back wheel */}
                <circle cx="15" cy="30" r="6" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
                <circle cx="15" cy="30" r="3" fill="#6b7280" />
              </svg>
            </div>
          </div>
        </div>

        {/* Floating packages in background */}
        <div className="absolute top-10 left-1/4 w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded animate-float-package-1 shadow-lg">
          <div className="absolute top-1 left-1 right-1 bottom-1 border border-white/30 rounded" />
        </div>
        <div className="absolute top-16 right-1/3 w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded animate-float-package-2 shadow-lg">
          <div className="absolute top-1 left-1 right-1 bottom-1 border border-white/30 rounded" />
        </div>
        <div className="absolute top-8 right-1/4 w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded animate-float-package-3 shadow-lg">
          <div className="absolute top-1 left-1 right-1 bottom-1 border border-white/30 rounded" />
        </div>
      </div>

      {/* Loading text and progress */}
      <div className="text-center space-y-4 z-10">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          PharmaGo
        </h2>
        <p className="text-lg text-gray-600 font-medium animate-pulse">
          Préparation de votre livraison express...
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes delivery-move {
          0%, 100% {
            transform: translateX(-20%);
          }
          50% {
            transform: translateX(120%);
          }
        }
        
        @keyframes bounce-package {
          0%, 100% {
            transform: translateY(0) rotate(-2deg);
          }
          50% {
            transform: translateY(-4px) rotate(2deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes float-package-1 {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-30px) rotate(5deg);
            opacity: 0.9;
          }
        }
        
        @keyframes float-package-2 {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-25px) rotate(-5deg);
            opacity: 0.8;
          }
        }
        
        @keyframes float-package-3 {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
            opacity: 1;
          }
        }
        
        @keyframes road-lines {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        
        .animate-delivery-move {
          animation: delivery-move 4s ease-in-out infinite;
        }
        
        .animate-bounce-package {
          animation: bounce-package 0.5s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
        }
        
        .animate-float-package-1 {
          animation: float-package-1 4s ease-in-out infinite;
        }
        
        .animate-float-package-2 {
          animation: float-package-2 3.5s ease-in-out infinite 0.5s;
        }
        
        .animate-float-package-3 {
          animation: float-package-3 4.5s ease-in-out infinite 1s;
        }
        
        .animate-road-lines {
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 20px,
            white 20px,
            white 40px
          );
          animation: road-lines 2s linear infinite;
        }
      `}} />
    </div>
  );
}
