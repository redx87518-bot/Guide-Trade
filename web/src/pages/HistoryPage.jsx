import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { callFunction } from '@/lib/appwrite';
import ResearchResult from '@/components/ResearchResult';

export default function HistoryPage({ onSelectResult }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await callFunction('history', {});
      setHistory(res.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleView = useCallback(async (item) => {
    const res = await callFunction('research', { 
      query: `${item.symbol || ''} ${item.title}`, 
      symbol: item.symbol,
      rerun: true,
    });
    setSelectedResult(res);
  }, []);

  const handleSaveReport = useCallback(async (item) => {
    try {
      await callFunction('report', {
        action: 'create',
        researchId: item.id,
        researchData: {
          symbol: item.symbol,
          title: item.title,
          summary: item.summary,
          bullishFactors: [],
          bearishFactors: [],
          risks: [],
          outlook: '',
          sources: [],
        },
      });
      alert('Report saved!');
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  }, []);

  const handleDelete = useCallback(async (item) => {
    if (confirm('Delete this research?')) {
      try {
        await callFunction('history', { action: 'delete', id: item.id });
        setHistory(prev => prev.filter(h => h.id !== item.id));
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  }, []);

  return (
    <div className="page history">
      <header className="page-header">
        <h1>Research History</h1>
      </header>

      {loading && <div className="loading">Loading history...</div>}
      {error && <div className="error">{error}</div>}

      <div className="history-list">
        {history.map(item => (
          <div key={item.id} className="history-item">
            <div className="history-info">
              <span className="symbol">{item.symbol}</span>
              <h4>{item.title}</h4>
              <p className="summary">{item.summary}</p>
              <time>{new Date(item.createdAt).toLocaleDateString()}</time>
              <span className={`confidence confidence--${item.confidence || 'low'}`}>
                {item.confidence || 'low'}
              </span>
            </div>
            <div className="history-actions">
              <button onClick={() => handleView(item)}>View</button>
              <button onClick={() => handleSaveReport(item)}>Save Report</button>
              <button className="btn-danger" onClick={() => handleDelete(item)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {selectedResult && (
        <div className="modal-overlay">
          <div className="modal modal--large">
            <button className="modal-close" onClick={() => setSelectedResult(null)}>×</button>
            <ResearchResult result={selectedResult} />
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }))}>
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'research' }))}>
          <span>Research</span>
        </button>
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'watchlist' }))}>
          <span>Watchlist</span>
        </button>
        <button className="nav-item active" onClick={() => {}}>
          <span>History</span>
        </button>
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' }))}>
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}
