import { useState, useCallback } from 'react';
import { databases, databaseId, COLLECTIONS } from '@/lib/appwrite';

export function useWatchlist() {
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWatchlists = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await databases.list(databaseId, COLLECTIONS.WATCHLISTS, [
        `equal("userId", "${userId}")`,
      ]);
      setWatchlists(res.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addWatchlist = useCallback(async (userId, name, symbols) => {
    setLoading(true);
    try {
      const doc = await databases.createDocument(databaseId, COLLECTIONS.WATCHLISTS, 'unique()', {
        userId, name, symbols, createdAt: new Date().toISOString(),
      });
      setWatchlists(prev => [...prev, doc]);
      return doc;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addSymbol = useCallback(async (userId, watchlistId, symbol) => {
    const wl = watchlists.find(w => w.$id === watchlistId);
    if (!wl) return;
    const symbols = [...(wl.symbols || []), symbol];
    await databases.updateDocument(databaseId, COLLECTIONS.WATCHLISTS, watchlistId, { symbols });
    setWatchlists(prev => prev.map(w => w.$id === watchlistId ? { ...w, symbols } : w));
  }, [watchlists]);

  const removeSymbol = useCallback(async (userId, watchlistId, symbol) => {
    const wl = watchlists.find(w => w.$id === watchlistId);
    if (!wl) return;
    const symbols = (wl.symbols || []).filter(s => s !== symbol);
    await databases.updateDocument(databaseId, COLLECTIONS.WATCHLISTS, watchlistId, { symbols });
    setWatchlists(prev => prev.map(w => w.$id === watchlistId ? { ...w, symbols } : w));
  }, [watchlists]);

  const deleteWatchlist = useCallback(async (userId, watchlistId) => {
    await databases.deleteDocument(databaseId, COLLECTIONS.WATCHLISTS, watchlistId);
    setWatchlists(prev => prev.filter(w => w.$id !== watchlistId));
  }, []);

  return { watchlists, loading, error, fetchWatchlists, addWatchlist, addSymbol, removeSymbol, deleteWatchlist };
}
