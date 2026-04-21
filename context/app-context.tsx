import { createContext, useContext } from 'react';

export type Category = {
  id: number;
  userId: number;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
};

export type Trip = {
  id: number;
  userId: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  createdAt: string;
};

export type Activity = {
  id: number;
  tripId: number;
  categoryId: number;
  userId: number;
  name: string;
  date: string;
  duration: number | null;
  count: number;
  notes: string | null;
  createdAt: string;
};

export type Target = {
  id: number;
  userId: number;
  tripId: number | null;
  categoryId: number | null;
  type: string;
  metric: string;
  value: number;
  createdAt: string;
};

export type AppContextType = {
  trips: Trip[];
  activities: Activity[];
  categories: Category[];
  targets: Target[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setTargets: React.Dispatch<React.SetStateAction<Target[]>>;
};

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppContext');
  return ctx;
}
