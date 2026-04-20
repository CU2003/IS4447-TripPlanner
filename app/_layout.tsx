import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';
import { db } from '@/db/client';
import { trips as tripsTable } from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';

export type Trip = {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  userId: number;
};

type AppContextType = {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  currentUserId: number;
};

export const AppContext = createContext<AppContextType | null>(null);

export default function RootLayout() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const currentUserId = 1;

  useEffect(() => {
    const load = async () => {
      await seedIfEmpty();
      const rows = await db.select().from(tripsTable);
      setTrips(rows);
    };

    void load();
  }, []);

  return (
    <AppContext.Provider value={{ trips, setTrips, currentUserId }}>
      <Stack />
    </AppContext.Provider>
  );
}
