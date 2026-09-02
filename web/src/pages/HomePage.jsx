import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Orb from '@/components/Orb';
import ResearchResult from '@/components/ResearchResult';

export default function HomePage({ onShowPage }) {
  const { user } = useAuth();
  const [latestResult, setLatestResult] = useState(null);

  const handleResearchComplete = (result) => {
    setLatestResult(result);
  };

  const handleVoiceMessage = (text) => {
    const msg = text || "Research is ready. Tap to view details.";
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(msg);
      utter.rate = 0.9;
      speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="page home">
      <header className="home-header">
        <div className="logo">Guide Trade</div>
      </header>

      <main className="home-main">
        <div className="home-content">
          <Orb onResearchComplete={handleResearchComplete} />
          
          {latestResult && (
            <div className="home-result-preview">
              <button 
                className="result-link"
                onClick={() => onShowPage('research', { result: latestResult })}
              >
                View Research: {latestResult.report?.symbol || 'Details'}
              </button>
            </div>
          )}
        </div>
      </main>

      <nav className="bottom-nav">
        <button className="nav-item active" onClick={() => onShowPage('home')}>
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={() => onShowPage('research')}>
          <span>Research</span>
        </button>
        <button className="nav-item" onClick={() => onShowPage('watchlist')}>
          <span>Watchlist</span>
        </button>
        <button className="nav-item" onClick={() => onShowPage('history')}>
          <span>History</span>
        </button>
        <button className="nav-item" onClick={() => onShowPage('settings')}>
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}
