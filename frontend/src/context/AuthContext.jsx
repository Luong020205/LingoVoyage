import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();
const API_BASE = 'http://localhost:5000/api';

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('lv_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('lv_token') || token;
    if (!savedToken) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  }, [token]);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('lv_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(savedToken);
        } else {
          localStorage.removeItem('lv_token');
          setToken(null);
        }
      } catch {
        localStorage.removeItem('lv_token');
        setToken(null);
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  // ĐĂNG NHẬP
  const login = useCallback(async ({ email, password, rememberMe }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const data = await res.json();
    if (!res.ok) throw data;

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('lv_token', data.token);
    return data;
  }, []);

  // ĐĂNG KÝ
  const register = useCallback(async (formData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw data;

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('lv_token', data.token);
    return data;
  }, []);

  // ĐĂNG XUẤT
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lv_token');
  }, []);

  // QUÊN MẬT KHẨU
  const forgotPassword = useCallback(async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }, []);

  // ĐẶT LẠI MẬT KHẨU
  const resetPassword = useCallback(async ({ email, otp, newPassword, confirmNewPassword }) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword, confirmNewPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }, []);

  // CHECK USERNAME
  const checkUsername = useCallback(async (username) => {
    if (!username || username.length < 3) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/check-username/${username}`);
      const data = await res.json();
      return data.available;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      checkUsername,
      refreshUser,
      API: 'http://localhost:5000'
    }}>
      {children}
    </AuthContext.Provider>
  );
}
