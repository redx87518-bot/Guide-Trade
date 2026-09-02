import { useState, useEffect, useRef, useCallback } from 'react';
import { callFunction } from '@/lib/appwrite';
import { useAuth } from '@/hooks/useAuth';

export function useResearch() {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState(null);

  const startResearch = useCallback(async (query, symbol, companyName) => {
    if (!user) {
      setError('Authentication required');
      return;
    }
    setLoading(true);
    setProgress('Creating research session...');
    setError(null);
    setResults(null);

    try {
      const res = await callFunction('research', { query, symbol, companyName, depth: 2 });
      
      if (res.error) {
        throw new Error(res.error || 'Research failed');
      }
      
      setResults(res);
      setProgress('Complete');
    } catch (err) {
      setError(err.message);
      setProgress('');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await callFunction('history', {});
      return res.results || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { results, loading, progress, error, startResearch, fetchHistory };
}
