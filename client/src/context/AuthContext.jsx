/**
 * AuthContext — ARCHITECTURE.md §3.4 (split, memoised), §11.
 *
 * On mount it silently restores the session: the access token is memory-only and
 * lost on reload, but the httpOnly refresh cookie survives — so we call /auth/refresh
 * then /auth/me. Value is memoised to avoid re-rendering every consumer (skill:
 * "Memoize context values").
 */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { authApi } from '../features/auth/authApi.js';
import { tokenService } from '../services/tokenService.js';
import { AUTH_LOGOUT_EVENT } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((accessToken, sessionUser, perms = []) => {
    tokenService.set(accessToken);
    setUser(sessionUser);
    setPermissions(perms);
  }, []);

  const clearSession = useCallback(() => {
    tokenService.clear();
    setUser(null);
    setPermissions([]);
  }, []);

  // Silent restore on first load.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const refreshed = await authApi.refresh();
        tokenService.set(refreshed.data.accessToken);
        const me = await authApi.me();
        if (active) {
          setUser(me.data.user);
          setPermissions(me.data.permissions || []);
        }
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [clearSession]);

  // Hard logout triggered by the API layer when refresh fails.
  useEffect(() => {
    const handler = () => clearSession();
    window.addEventListener(AUTH_LOGOUT_EVENT, handler);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handler);
  }, [clearSession]);

  const login = useCallback(
    async (credentials) => {
      const res = await authApi.login(credentials);
      const me = await (async () => {
        tokenService.set(res.data.accessToken);
        return authApi.me();
      })();
      applySession(res.data.accessToken, me.data.user, me.data.permissions);
      return me.data.user;
    },
    [applySession]
  );

  const register = useCallback((payload) => authApi.register(payload), []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      permissions,
      loading,
      isAuthenticated: Boolean(user),
      hasPermission: (p) => permissions.includes('*') || permissions.includes(p),
      login,
      register,
      logout,
      setUser,
    }),
    [user, permissions, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
