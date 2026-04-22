import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { targets } from '@/db/schema';
import { useAppContext } from '@/context/app-context';
import { useTheme } from '@/context/theme-context';
import ScreenHeader from '@/components/ui/screen-header';
import PrimaryButton from '@/components/ui/primary-button';
import ProgressBar from '@/components/ui/progress-bar';
import { getWeekStart, getMonthStart, todayStr } from '@/utils/date';

export default function TargetsScreen() {
  const router = useRouter();
  const { targets: targetList, activities, trips, categories, setTargets } = useAppContext();
  const { colors } = useTheme();

  const calcProgress = (target: typeof targetList[0]): number => {
    const start = target.type === 'weekly' ? getWeekStart() : getMonthStart();
    const today = todayStr();

    let filtered = activities.filter((a) => a.date >= start && a.date <= today);
    if (target.tripId) filtered = filtered.filter((a) => a.tripId === target.tripId);
    if (target.categoryId) filtered = filtered.filter((a) => a.categoryId === target.categoryId);

    if (target.metric === 'duration') {
      return filtered.reduce((sum, a) => sum + (a.duration ?? 0), 0);
    }
    return filtered.reduce((sum, a) => sum + a.count, 0);
  };

  const getLabel = (target: typeof targetList[0]): string => {
    const parts: string[] = [];
    if (target.tripId) {
      const trip = trips.find((t) => t.id === target.tripId);
      if (trip) parts.push(trip.name);
    }
    if (target.categoryId) {
      const cat = categories.find((c) => c.id === target.categoryId);
      if (cat) parts.push(cat.name);
    }
    const metricLabel = target.metric === 'duration' ? 'minutes' : 'activities';
    const scope = parts.length > 0 ? parts.join(' · ') : 'All Activities';
    return `${scope} — ${target.value} ${metricLabel}`;
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Target', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(targets).where(eq(targets.id, id));
          setTargets((prev) => prev.filter((t) => t.id !== id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Targets" subtitle={`${targetList.length} goal${targetList.length !== 1 ? 's' : ''}`} />

      <PrimaryButton label="+ Add Target" onPress={() => router.push('/target/add')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {targetList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No targets yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Set weekly or monthly goals to track your progress.
            </Text>
          </View>
        ) : (
          targetList.map((target) => (
            <View key={target.id}>
              <ProgressBar
                label={getLabel(target)}
                current={calcProgress(target)}
                target={target.value}
                period={target.type}
              />
              <Pressable
                accessibilityLabel="Delete target"
                accessibilityRole="button"
                onPress={() => handleDelete(target.id)}
                style={[styles.deleteBtn, { borderColor: '#FCA5A5' }]}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  content: { paddingBottom: 32, paddingTop: 14 },
  deleteBtn: {
    alignSelf: 'flex-end',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    marginTop: -6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: { color: '#7F1D1D', fontSize: 13, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingTop: 48 },
  emptyEmoji: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});
