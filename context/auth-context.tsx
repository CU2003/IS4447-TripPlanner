// stores the logged in user and makes it accessable accross the whole app
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

// throws an error if used outside of the provider which helps with debuging
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthContext');
  return ctx;
}
