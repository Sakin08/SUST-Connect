// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check localStorage flag to see if user might be logged in
        const hasAuth = localStorage.getItem('hasAuth');
        const accessToken = localStorage.getItem('accessToken');

        if (!hasAuth || !accessToken) {
          // Skip the API call if we know there's no auth
          setLoading(false);
          return;
        }

        console.log('🔄 Loading user profile...');
        const res = await api.get('/auth/profile');
        setUser(res.data);
        localStorage.setItem('hasAuth', 'true');
        console.log('✅ User loaded successfully');
      } catch (err) {
        console.error('❌ Failed to load user:', err.response?.status, err.response?.data);
        // User is not logged in or token expired
        setUser(null);
        try {
          localStorage.removeItem('hasAuth');
          localStorage.removeItem('accessToken');
        } catch (storageError) {
          console.error('Failed to clear localStorage:', storageError);
        }
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    // Store access token in localStorage
    if (res.data.accessToken) {
      try {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('hasAuth', 'true');
        console.log('✅ Token stored successfully');
      } catch (error) {
        console.error('❌ Failed to store token in localStorage:', error);
        // iOS Safari private mode blocks localStorage
        alert('Please disable private browsing mode to use this app on iOS Safari');
        throw new Error('localStorage not available. Please disable private browsing.');
      }
    }

    // After login, reload user profile to ensure we have latest data
    const profileRes = await api.get('/auth/profile');
    setUser(profileRes.data);

    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('hasAuth');
      localStorage.removeItem('accessToken');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);