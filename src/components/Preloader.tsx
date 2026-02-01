export default function Preloader() {
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
        preload="auto"
        disableRemotePlayback
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          objectFit: 'cover',
          transform: 'translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        <source src="/ChargementLogo.mp4" type="video/mp4" />
        Votre navigateur ne prend pas en charge la vidéo.
      </video>

      {/* Glassmorphism overlay for smoother integration */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />

      {/* Accessible loading text for screen readers (hidden visually) */}
      <span className="sr-only">Chargement de PharmaGo...</span>
    </div>
  );
}
