import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export type ThemeContextType = {
  theme: ThemeMode;
  toggleTheme: () => void;
  colors: typeof lightColors;
};

export const lightColors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  borderInput: '#CBD5E1',
  primary: '#0F766E',
  primaryText: '#FFFFFF',
  filterBg: '#0F172A',
  filterText: '#FFFFFF',
  filterInactiveBg: '#FFFFFF',
  filterInactiveText: '#0F172A',
  searchBg: '#FFFFFF',
  searchBorder: '#94A3B8',
  danger: '#FEF2F2',
  dangerBorder: '#FCA5A5',
  dangerText: '#7F1D1D',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  label: '#334155',
};

export const darkColors: typeof lightColors = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  borderInput: '#475569',
  primary: '#14B8A6',
  primaryText: '#FFFFFF',
  filterBg: '#14B8A6',
  filterText: '#FFFFFF',
  filterInactiveBg: '#1E293B',
  filterInactiveText: '#F1F5F9',
  searchBg: '#1E293B',
  searchBorder: '#475569',
  danger: '#450A0A',
  dangerBorder: '#7F1D1D',
  dangerText: '#FCA5A5',
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  label: '#94A3B8',
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeContext');
  return ctx;
}
