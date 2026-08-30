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
  /** `true` tant que la session n'a pas été résolue (hydratation incluse). */
  loading: boolean;
  /** `true` dès que l'état d'auth est fiable côté client. */
  pret: boolean;
  token: string | null;
  restaurateur: Restaurateur | null;
  restaurant: Restaurant | null;
  setSession: (payload: AuthPayload) => void;
  majRestaurant: (restaurant: Restaurant) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [restaurateur, setRestaurateur] = useState<Restaurateur | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    const stocke = readToken();
    if (!stocke) {
      setLoading(false);
      return;
    }
    setToken(stocke);
    let annule = false;
    authApi
      .session(stocke)
      .then((data) => {
        if (annule) return;
        setRestaurateur(data.restaurateur);
        setRestaurant(data.restaurant);
      })
      .catch(() => {
        if (annule) return;
        clearToken();
        setToken(null);
      })
      .finally(() => {
        if (!annule) setLoading(false);
      });
    return () => {
      annule = true;
    };
  }, []);

  const setSession = useCallback((payload: AuthPayload) => {
    saveToken(payload.token);
    setToken(payload.token);
    setRestaurateur(payload.restaurateur);
    setRestaurant(payload.restaurant);
    setLoading(false);
  }, []);

  const majRestaurant = useCallback((r: Restaurant) => setRestaurant(r), []);

  const signOut = useCallback(() => {
    clearToken();
    setToken(null);
    setRestaurateur(null);
    setRestaurant(null);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      pret: !loading,
      token,
      restaurateur,
      restaurant,
      setSession,
      majRestaurant,
      signOut,
    }),
    [loading, token, restaurateur, restaurant, setSession, majRestaurant, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
