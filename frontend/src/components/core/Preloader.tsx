import { useEffect, useRef, useState } from 'react';

const Preloader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentBpm, setCurrentBpm] = useState(72);
  const [statusMessage, setStatusMessage] = useState('Préparation en cours...');
  const [messageIndex, setMessageIndex] = useState(0);

  const statusMessages = [
    'Préparation en cours...',
    'Chargement des données...',
    'Connexion sécurisée...',
    'Initialisation...',
    'Presque prêt...',
    'Terminé !'
  ];

  useEffect(() => {
    // --- BPM & Status Logic ---
    const bpmInterval = setInterval(() => {
      const variation = Math.floor(Math.random() * 9) - 4;
      setCurrentBpm(prev => {
        const newValue = Math.max(68, Math.min(76, 72 + variation));
        return newValue;
      });
    }, 800);

    const messageInterval = setInterval(() => {
      setMessageIndex(prev => {
        const next = Math.min(prev + 1, statusMessages.length - 1);
        setStatusMessage(statusMessages[next]);
        return next;
      });
    }, 2000);

    return () => {
      clearInterval(bpmInterval);
      clearInterval(messageInterval);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // --- ECG Path Generation ---
    const generateFullECGPath = () => {
      const path = [];
      const totalBeats = 2.5;
      const pointsPerBeat = 120;
      const totalPoints = Math.floor(totalBeats * pointsPerBeat);

      const pAmp = 5;
      const qDepth = -8;
      const rHeight = 42;
      const sDepth = -18;
      const tAmp = 8;

      for (let i = 0; i < totalPoints; i++) {
        const beatPosition = (i % pointsPerBeat) / pointsPerBeat;
        let y = (Math.random() - 0.5) * 0.3;

        if (beatPosition >= 0.08 && beatPosition <= 0.16) {
          const pt = (beatPosition - 0.08) / 0.08;
          y += pAmp * Math.sin(pt * Math.PI);
        }
        if (beatPosition >= 0.20 && beatPosition <= 0.235) {
          const qt = (beatPosition - 0.20) / 0.035;
          y += qDepth * Math.sin(qt * Math.PI);
        }
        if (beatPosition >= 0.235 && beatPosition <= 0.29) {
          const rt = (beatPosition - 0.235) / 0.055;
          y += rHeight * Math.sin(rt * Math.PI);
        }
        if (beatPosition >= 0.29 && beatPosition <= 0.34) {
          const st = (beatPosition - 0.29) / 0.05;
          y += sDepth * Math.sin(st * Math.PI);
        }
        if (beatPosition >= 0.60 && beatPosition <= 0.72) {
          const tt = (beatPosition - 0.60) / 0.12;
          y += tAmp * Math.sin(tt * Math.PI);
        }

        path.push(y);
      }
      return path;
    };

    const ecgPath = generateFullECGPath();
    let animationProgress = 0;
    let lastTime = performance.now();
    const animationDuration = 3;
    let animationFrameId: number;

    const drawECG = () => {
      const W = canvas.width;
      const H = canvas.height;
      const midY = H / 2;

      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      animationProgress += dt / animationDuration;
      if (animationProgress > 1) animationProgress = 0;

      const currentIndex = Math.floor(animationProgress * ecgPath.length);

      ctx.clearRect(0, 0, W, H);
      const spacing = W / ecgPath.length;

      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ff94';
      ctx.strokeStyle = '#00ff94';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let i = 0; i < ecgPath.length; i++) {
        const x = i * spacing;
        const y = midY - ecgPath[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (currentIndex < ecgPath.length) {
        const pointX = currentIndex * spacing;
        const pointY = midY - ecgPath[currentIndex];

        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pointX, pointY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00ff94';
        ctx.beginPath();
        ctx.arc(pointX, pointY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(drawECG);
    };

    drawECG();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="preloader-v3-root">
      <style>{`
        .preloader-v3-root {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          --primary: #00ff94;
          --secondary: #00e5ff;
          --background: #0a0e27;
          --surface: #141937;
          --text-light: #ffffff;
          font-family: 'DM Sans', sans-serif;
          background: var(--background);
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          z-index: 99999;
          transition: opacity 0.8s ease;
        }

        .wave-container {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        .wave {
            position: absolute;
            width: 200%;
            height: 100%;
            background: linear-gradient(90deg, 
                transparent, 
                rgba(0, 255, 148, 0.05), 
                transparent
            );
            animation: waveMove 15s linear infinite;
        }

        .wave:nth-child(1) { animation-delay: 0s; }
        .wave:nth-child(2) {
            animation-delay: 5s;
            background: linear-gradient(90deg, 
                transparent, 
                rgba(0, 229, 255, 0.05), 
                transparent
            );
        }
        .wave:nth-child(3) { animation-delay: 10s; }

        @keyframes waveMove {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
        }

        .loader-wrapper {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 60px;
        }

        .glow-circle {
            position: absolute;
            width: 320px;
            height: 320px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(0, 255, 148, 0.18) 0%, rgba(0, 229, 255, 0.08) 40%, transparent 70%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 0;
            animation: glowPulse 3s ease-in-out infinite;
        }

        .glow-circle::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 1px solid rgba(0, 255, 148, 0.15);
            animation: glowRing 3s ease-in-out infinite;
        }

        .glow-circle::after {
            content: '';
            position: absolute;
            width: 140%;
            height: 140%;
            top: -20%;
            left: -20%;
            border-radius: 50%;
            border: 1px solid rgba(0, 229, 255, 0.08);
            animation: glowRing 3s ease-in-out infinite 1s;
        }

        @keyframes glowPulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
            50% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
        }

        @keyframes glowRing {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.05); opacity: 0.7; }
        }

        .logo-pill {
            position: relative;
            background: linear-gradient(135deg, var(--surface) 0%, rgba(20, 25, 55, 0.8) 100%);
            border: 2px solid rgba(0, 255, 148, 0.2);
            border-radius: 60px;
            padding: 30px 60px;
            box-shadow: 0 0 40px rgba(0, 255, 148, 0.1), inset 0 0 40px rgba(0, 255, 148, 0.05);
            animation: pillEntrance 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                       pillFloat 4s ease-in-out infinite 1.2s,
                       pillGlowPulse 3s ease-in-out infinite 1.2s;
            overflow: hidden;
        }

        @keyframes pillEntrance {
            0% { opacity: 0; transform: scale(0.8) rotateX(90deg); }
            100% { opacity: 1; transform: scale(1) rotateX(0deg); }
        }

        @keyframes pillFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-10px) scale(1.02); }
        }

        @keyframes pillGlowPulse {
            0%, 100% {
                box-shadow: 0 0 40px rgba(0, 255, 148, 0.1), inset 0 0 40px rgba(0, 255, 148, 0.05);
                border-color: rgba(0, 255, 148, 0.2);
            }
            50% {
                box-shadow: 0 0 60px rgba(0, 255, 148, 0.3), inset 0 0 60px rgba(0, 255, 148, 0.1);
                border-color: rgba(0, 255, 148, 0.5);
            }
        }

        .logo-pill::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            animation: shine 3s ease-in-out infinite;
        }

        @keyframes shine {
            0% { left: -100%; }
            50%, 100% { left: 100%; }
        }

        .logo-text {
            position: relative;
            display: flex;
            align-items: center;
            gap: 20px;
            font-family: 'Archivo', sans-serif;
        }

        .brand-name {
            font-size: clamp(2rem, 7vw, 4rem);
            font-weight: 800;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            position: relative;
            animation: textShimmer 3s ease-in-out infinite;
            background-size: 200% 200%;
        }

        @keyframes textShimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }

        .dot-separator {
            width: 12px;
            height: 12px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 50%;
            box-shadow: 0 0 20px var(--primary);
            animation: dotRotate 4s linear infinite;
        }

        @keyframes dotRotate {
            0% { transform: scale(1); box-shadow: 0 0 20px var(--primary); }
            50% { transform: scale(1.5); box-shadow: 0 0 30px var(--secondary); }
            100% { transform: scale(1); box-shadow: 0 0 20px var(--primary); }
        }

        .progress-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 25px;
            animation: fadeIn 1s 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }

        @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
        }

        .ecg-container {
            width: 350px;
            height: 100px;
            position: relative;
            overflow: hidden;
            padding: 0;
        }



        .heartbeat-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        #ecgCanvas {
            width: 100%;
            height: 100%;
            display: block;
        }

        .heart-rate-display {
            position: absolute;
            top: 10px;
            right: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Archivo', monospace;
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--primary);
            text-shadow: 0 0 10px var(--primary);
            z-index: 10;
        }

        .heart-icon {
            width: 20px;
            height: 20px;
            animation: heartBeat 1s ease-in-out infinite;
        }

        @keyframes heartBeat {
            0%, 100% { transform: scale(1); }
            10% { transform: scale(1.2); }
            20% { transform: scale(1); }
            30% { transform: scale(1.15); }
            40% { transform: scale(1); }
        }

        .status-info {
            text-align: center;
        }

        .status-label {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.5);
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .status-message-text {
            font-size: 1.1rem;
            color: var(--text-light);
            font-weight: 600;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: statusTextWave 2s ease-in-out infinite;
            background-size: 200% 200%;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }

        @keyframes statusTextWave {
            0%, 100% { background-position: 0% 50%; transform: translateX(0); }
            50% { background-position: 100% 50%; transform: translateX(5px); }
        }

        .particle-field {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        .particle {
            position: absolute;
            width: 3px;
            height: 3px;
            background: var(--primary);
            border-radius: 50%;
            opacity: 0;
            animation: particleFloat 6s ease-in-out infinite;
        }

        .particle:nth-child(odd) { background: var(--secondary); }

        @keyframes particleFloat {
            0% { opacity: 0; transform: translateY(100vh) translateX(0) scale(0) rotate(0deg); }
            10% { opacity: 0.8; }
            50% { transform: translateY(50vh) translateX(25px) scale(1.2) rotate(180deg); }
            90% { opacity: 0.8; }
            100% { opacity: 0; transform: translateY(-100vh) translateX(50px) scale(0.5) rotate(360deg); }
        }

        .particle:nth-child(1) { left: 10%; animation-delay: 0s; animation-duration: 7s; }
        .particle:nth-child(2) { left: 25%; animation-delay: 1s; animation-duration: 8s; }
        .particle:nth-child(3) { left: 40%; animation-delay: 2s; animation-duration: 6s; }
        .particle:nth-child(4) { left: 55%; animation-delay: 1.5s; animation-duration: 7.5s; }
        .particle:nth-child(5) { left: 70%; animation-delay: 0.5s; animation-duration: 8.5s; }
        .particle:nth-child(6) { left: 85%; animation-delay: 2.5s; animation-duration: 7s; }

        @media (max-width: 768px) {
            .logo-pill { padding: 25px 45px; border-radius: 50px; }
            .ecg-container { width: 300px; height: 90px; }
        }
        @media (max-width: 480px) {
            .logo-pill { padding: 20px 35px; }
            .loader-wrapper { gap: 40px; }
            .ecg-container { width: 250px; height: 80px; }
        }
      `}</style>

      <div className="wave-container">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      <div className="particle-field">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      <div className="loader-wrapper">
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glow-circle"></div>
          <div className="logo-pill">
            <div className="logo-text">
              <span className="brand-name">Pharma</span>
              <div className="dot-separator"></div>
              <span className="brand-name">Go</span>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <div className="ecg-container">
            <div className="heart-rate-display">
              <svg className="heart-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="bpm-value">{currentBpm}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '4px' }}>BPM</span>
            </div>

            <div className="heartbeat-line">
              <canvas ref={canvasRef} id="ecgCanvas"></canvas>
            </div>
          </div>

          <div className="status-info">
            <div className="status-label">Status</div>
            <div className="status-message-text">{statusMessage}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
