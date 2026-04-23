import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/app-context';
import { useTheme } from '@/context/theme-context';
import ScreenHeader from '@/components/ui/screen-header';
import BarChart from '@/components/ui/bar-chart';
import ProgressBar from '@/components/ui/progress-bar';
import { getLast7Days, dayLabel, getWeekStart, getMonthStart, todayStr } from '@/utils/date';

type Weather = { temperature: number; windspeed: number; city: string } | null;

const DESTINATIONS = [
  { city: 'Paris', lat: 48.8566, lon: 2.3522 },
  { city: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { city: 'Rome', lat: 41.9028, lon: 12.4964 },
  { city: 'Barcelona', lat: 41.3851, lon: 2.1734 },
  { city: 'Dublin', lat: 53.3498, lon: -6.2603 },
];

export default function InsightsScreen() {
  const { trips, activities, targets, categories } = useAppContext();
  const { colors } = useTheme();
  const [weather, setWeather] = useState<Weather>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(false);
      try {
        const dest = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${dest.lat}&longitude=${dest.lon}&current_weather=true`
        );
        if (!res.ok) throw new Error('API error');
        const data = (await res.json()) as { current_weather: { temperature: number; windspeed: number } };
        setWeather({ temperature: data.current_weather.temperature, windspeed: data.current_weather.windspeed, city: dest.city });
      } catch {
        setWeatherError(true);
      } finally {
        setWeatherLoading(false);
      }
    };
    void fetchWeather();
  }, []);

  const last7 = getLast7Days();
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();
  const today = todayStr();

  const barData = last7.map((date) => ({
    label: dayLabel(date),
    value: activities.filter((a) => a.date === date).length,
  }));

  const weeklyCount = activities.filter((a) => a.date >= weekStart && a.date <= today).length;
  const monthlyCount = activities.filter((a) => a.date >= monthStart && a.date <= today).length;

  const categoryBreakdown = categories
    .map((cat) => ({
      label: cat.name,
      value: activities.filter((a) => a.categoryId === cat.id && a.date >= weekStart && a.date <= today).length,
    }))
    .filter((d) => d.value > 0);

  const calcProgress = (target: typeof targets[0]): number => {
    const start = target.type === 'weekly' ? weekStart : monthStart;
    let filtered = activities.filter((a) => a.date >= start && a.date <= today);
    if (target.tripId) filtered = filtered.filter((a) => a.tripId === target.tripId);
    if (target.categoryId) filtered = filtered.filter((a) => a.categoryId === target.categoryId);
    if (target.metric === 'duration') return filtered.reduce((sum, a) => sum + (a.duration ?? 0), 0);
    return filtered.reduce((sum, a) => sum + a.count, 0);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Insights" subtitle="Your trips at a glance" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={[styles.weatherCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.weatherTitle, { color: colors.textSecondary }]}>Weather at a Destination</Text>
          {weatherLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : weatherError ? (
            <Text style={[styles.weatherCity, { color: colors.text }]}>Could not load weather data.</Text>
          ) : weather ? (
            <>
              <Text style={[styles.weatherCity, { color: colors.text }]}>📍 {weather.city}</Text>
              <Text style={[styles.weatherTemp, { color: colors.primary }]}>{weather.temperature}°C</Text>
              <Text style={[styles.weatherDetail, { color: colors.textSecondary }]}>Wind: {weather.windspeed} km/h</Text>
            </>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{trips.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Trips</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{weeklyCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Week</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{monthlyCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Month</Text>
          </View>
        </View>

        <BarChart data={barData} title="Activities — Last 7 Days" />

        {categoryBreakdown.length > 0 && (
          <BarChart data={categoryBreakdown} title="By Category — This Week" />
        )}

        {targets.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Targets</Text>
            {targets.map((target) => {
              const tripName = target.tripId
                ? trips.find((t) => t.id === target.tripId)?.name ?? 'Trip'
                : 'All Activities';
              return (
                <ProgressBar
                  key={target.id}
                  label={tripName}
                  current={calcProgress(target)}
                  target={target.value}
                  period={target.type}
                />
              );
            })}
          </View>
        )}

        {activities.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No data yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add trips and activities to see your insights.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  content: { paddingBottom: 32, paddingTop: 4 },
  weatherCard: { borderRadius: 14, borderWidth: 1, marginBottom: 16, padding: 16 },
  weatherTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  weatherCity: { fontSize: 16, fontWeight: '600' },
  weatherTemp: { fontSize: 32, fontWeight: '800', marginTop: 4 },
  weatherDetail: { fontSize: 13, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  section: { marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});
