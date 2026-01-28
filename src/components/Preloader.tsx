export default function Preloader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden"
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

      {/* Accessible loading text for screen readers (hidden visually) */}
      <span className="sr-only">Chargement de PharmaGo...</span>
    </div>
  );
}
