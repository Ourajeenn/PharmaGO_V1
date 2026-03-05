import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'leaflet/dist/leaflet.css'

import { ComparisonProvider } from './contexts/ComparisonContext'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#e2e8f0',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💊</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Oups ! Quelque chose s'est mal passé.
          </h1>
          <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '420px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            PharmaGo a rencontré une erreur inattendue. Veuillez recharger l'application pour continuer.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            🔄 Recharger l'application
          </button>
          <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2rem' }}>
            PharmaGo Express — Votre pharmacie à portée de main
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

import { DataSaverProvider } from "./contexts/DataSaverContext";
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline support and caching
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Prompt user to refresh if needed (can be enhanced later)
      console.log('New content available, please refresh.');
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <DataSaverProvider>
        <ComparisonProvider>
          <App />
        </ComparisonProvider>
      </DataSaverProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
