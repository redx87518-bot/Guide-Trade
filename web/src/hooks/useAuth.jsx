import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, isAuthed } from '@/lib/appwrite';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authed = await isAuthed();
    if (authed) {
      const u = await getCurrentUser();
      setUser(u);
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
