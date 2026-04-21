import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { appSettings, categories as categoriesTable, trips as tripsTable, activities as activitiesTable, targets as targetsTable, users } from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';
import { AuthContext, type AuthUser } from '@/context/auth-context';
import { AppContext, type Category, type Trip, type Activity, type Target } from '@/context/app-context';
import { ThemeContext, type ThemeMode, lightColors, darkColors } from '@/context/theme-context';

export default function RootLayout() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      await seedIfEmpty();

      const themeRow = await db.select().from(appSettings).where(eq(appSettings.key, 'theme'));
      if (themeRow.length > 0) setTheme(themeRow[0].value as ThemeMode);

      const sessionRow = await db.select().from(appSettings).where(eq(appSettings.key, 'current_user_id'));
      const sessionId = sessionRow.length > 0 ? parseInt(sessionRow[0].value) : 1;
      const userRows = await db.select().from(users).where(eq(users.id, sessionId));
      if (userRows.length > 0) {
        const u = userRows[0];
        setUser({ id: u.id, email: u.email, name: u.name });
        await loadAppData(u.id);
      }

      setLoaded(true);
    };

    void init();
  }, []);

  const loadAppData = async (userId: number) => {
    const [tripRows, catRows, activityRows, targetRows] = await Promise.all([
      db.select().from(tripsTable).where(eq(tripsTable.userId, userId)),
      db.select().from(categoriesTable).where(eq(categoriesTable.userId, userId)),
      db.select().from(activitiesTable).where(eq(activitiesTable.userId, userId)),
      db.select().from(targetsTable).where(eq(targetsTable.userId, userId)),
    ]);
    setTrips(tripRows as Trip[]);
    setCategories(catRows as Category[]);
    setActivities(activityRows as Activity[]);
    setTargets(targetRows as Target[]);
  };

  const handleSetUser = (u: AuthUser | null) => {
    setUser(u);
    if (u) void loadAppData(u.id);
    else {
      setTrips([]);
      setCategories([]);
      setActivities([]);
      setTargets([]);
    }
  };

  const toggleTheme = async () => {
    const next: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    const existing = await db.select().from(appSettings).where(eq(appSettings.key, 'theme'));
    if (existing.length > 0) {
      await db.update(appSettings).set({ value: next }).where(eq(appSettings.key, 'theme'));
    } else {
      await db.insert(appSettings).values({ key: 'theme', value: next });
    }
  };

  if (!loaded) return null;

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      <AuthContext.Provider value={{ user, setUser: handleSetUser }}>
        <AppContext.Provider value={{ trips, activities, categories, targets, setTrips, setActivities, setCategories, setTargets }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="category/index" options={{ headerShown: true, title: 'Categories' }} />
            <Stack.Screen name="category/add" options={{ headerShown: true, title: 'Add Category' }} />
            <Stack.Screen name="category/[id]/edit" options={{ headerShown: true, title: 'Edit Category' }} />
            <Stack.Screen name="trip/add" options={{ headerShown: true, title: 'Add Trip' }} />
            <Stack.Screen name="trip/[id]" options={{ headerShown: true, title: 'Trip Detail' }} />
            <Stack.Screen name="trip/[id]/edit" options={{ headerShown: true, title: 'Edit Trip' }} />
            <Stack.Screen name="activity/add" options={{ headerShown: true, title: 'Add Activity' }} />
            <Stack.Screen name="activity/[id]/edit" options={{ headerShown: true, title: 'Edit Activity' }} />
            <Stack.Screen name="target/index" options={{ headerShown: true, title: 'Targets' }} />
            <Stack.Screen name="target/add" options={{ headerShown: true, title: 'Add Target' }} />
          </Stack>
        </AppContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
