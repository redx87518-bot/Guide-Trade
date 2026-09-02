import { useState, useEffect, useCallback } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useAuth } from '@/hooks/useAuth';

export default function WatchlistPage() {
  const { user } = useAuth();
  const { watchlists, loading, error, fetchWatchlists, addWatchlist, addSymbol, removeSymbol, deleteWatchlist } = useWatchlist();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSymbols, setNewSymbols] = useState('');

  useEffect(() => {
    if (user) fetchWatchlists(user.$id);
  }, [user, fetchWatchlists]);

  const handleAddWatchlist = useCallback(async () => {
    if (!newName.trim()) return;
    const symbols = newSymbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    try {
      await addWatchlist(user.$id, newName, symbols);
      setShowAddModal(false);
      setNewName('');
      setNewSymbols('');
    } catch (err) {
      console.error(err);
    }
  }, [newName, newSymbols, user, addWatchlist]);

  const handleRemoveSymbol = useCallback(async (watchlistId, symbol) => {
    await removeSymbol(user.$id, watchlistId, symbol);
  }, [user, removeSymbol]);

  return (
    <div className="page watchlist">
      <header className="page-header">
        <h1>Your Watchlists</h1>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + New Watchlist
        </button>
      </header>

      {loading && <div className="loading">Loading watchlists...</div>}
      {error && <div className="error">{error}</div>}

      <div className="watchlist-list">
        {watchlists.map(wl => (
          <div key={wl.$id} className="watchlist-card">
            <h3>{wl.name}</h3>
            <div className="symbols">
              {(wl.symbols || []).map((s, i) => (
                <span key={i} className="symbol-badge">
                  {s}
                  <button onClick={() => handleRemoveSymbol(wl.$id, s)}>×</button>
                </span>
              ))}
            </div>
            <div className="watchlist-actions">
              <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'research', search: wl.name }))}>
                Research
              </button>
              <button className="btn-danger" onClick={() => deleteWatchlist(user.$id, wl.$id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Watchlist</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Watchlist name"
            />
            <input
              type="text"
              value={newSymbols}
              onChange={(e) => setNewSymbols(e.target.value)}
              placeholder="Symbols (comma-separated, e.g. AAPL, NVDA, TSLA)"
            />
            <div className="modal-actions">
              <button onClick={handleAddWatchlist}>Create</button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
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
        <button className="nav-item active" onClick={() => {}}>
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
