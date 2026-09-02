import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import HomePage from '@/pages/HomePage';
import ResearchPage from '@/pages/ResearchPage';
import WatchlistPage from '@/pages/WatchlistPage';
import HistoryPage from '@/pages/HistoryPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import '@/index.css';

function AppRouter() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('home');
  const [pageProps, setPageProps] = useState({});

  useEffect(() => {
    const handler = (e) => {
      setPage(e.detail);
      setPageProps({});
    };
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={() => setPage('home')} />;
  }

  switch (page) {
    case 'home':
      return <HomePage onShowPage={setPage} />;
    case 'research':
      return <ResearchPage />;
    case 'watchlist':
      return <WatchlistPage />;
    case 'history':
      return <HistoryPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <HomePage onShowPage={setPage} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
