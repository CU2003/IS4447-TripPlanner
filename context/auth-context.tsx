import { createContext, useContext } from 'react';

export type AuthUser = {
  id: number;
  email: string;
  name: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthContext');
  return ctx;
}
