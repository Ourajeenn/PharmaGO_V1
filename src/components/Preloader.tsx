export default function Preloader() {
  console.log("Rendering NEW Preloader component with video");
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/preloader.mp4" type="video/mp4" />
        Votre navigateur ne prend pas en charge la vidéo.
      </video>

      {/* Subtle overlay to ensure the video isn't too jarring and content feels integrated */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />

      {/* Visual Indicator for testing */}
      <div className="relative z-10 bg-white/20 backdrop-blur-md p-4 rounded-xl border border-white/30 text-primary font-black uppercase tracking-widest text-sm animate-pulse">
        Chargement PharmaGo...
      </div>

      {/* Accessible loading text for screen readers (hidden visually) */}
      <span className="sr-only">Chargement de PharmaGo...</span>
    </div>
  );
}
