import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  authApi,
  clearToken,
  readToken,
  saveToken,
  type AuthPayload,
  type Restaurant,
  type Restaurateur,
} from "@/lib/auth-api";

type AuthState = {
  loading: boolean;
  restaurateur: Restaurateur | null;
  restaurant: Restaurant | null;
  setSession: (payload: AuthPayload) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [restaurateur, setRestaurateur] = useState<Restaurateur | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    authApi
      .session(token)
      .then((data) => {
        if (cancelled) return;
        setRestaurateur(data.restaurateur);
        setRestaurant(data.restaurant);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setSession = useCallback((payload: AuthPayload) => {
    saveToken(payload.token);
    setRestaurateur(payload.restaurateur);
    setRestaurant(payload.restaurant);
    setLoading(false);
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setRestaurateur(null);
    setRestaurant(null);
  }, []);

  const value = useMemo(
    () => ({ loading, restaurateur, restaurant, setSession, signOut }),
    [loading, restaurateur, restaurant, setSession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
