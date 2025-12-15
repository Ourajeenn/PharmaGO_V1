import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { ComparisonProvider } from './contexts/ComparisonContext'

createRoot(document.getElementById("root")!).render(
  <ComparisonProvider>
    <App />
  </ComparisonProvider>
);
