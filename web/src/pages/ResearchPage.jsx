import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useResearch } from '@/hooks/useResearch';
import ResearchResult from '@/components/ResearchResult';

export default function ResearchPage() {
  const { user } = useAuth();
  const { results, loading, progress, error, startResearch } = useResearch();
  const [query, setQuery] = useState('');
  const [symbol, setSymbol] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    const sym = symbol.trim() || query.match(/\b([A-Z]{1,5})\b/i)?.[1]?.toUpperCase() || null;
    await startResearch(query, sym, null);
    setShowResult(true);
  }, [query, symbol, startResearch]);

  const handleVoice = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.9;
      speechSynthesis.speak(utter);
    }
  }, []);

  return (
    <div className="page research">
      <header className="page-header">
        <h1>Research</h1>
      </header>

      <div className="research-input">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a research question, e.g. 'Research NVIDIA' or 'Find today news about Tesla'"
          rows={3}
        />
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Symbol (optional, e.g. NVDA)"
          className="symbol-input"
        />
        <button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? 'Researching...' : 'Start Research'}
        </button>
      </div>

      {progress && <div className="progress">{progress}</div>}
      {error && <div className="error">{error}</div>}

      {showResult && results && (
        <ResearchResult result={results} />
      )}

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }))}>
          <span>Home</span>
        </button>
        <button className="nav-item active" onClick={() => {}}>
          <span>Research</span>
        </button>
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'watchlist' }))}>
          <span>Watchlist</span>
        </button>
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'history' }))}>
          <span>History</span>
        </button>
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' }))}>
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}
