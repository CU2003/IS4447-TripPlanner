import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { trips, activities as activitiesTable } from '@/db/schema';
import { useAppContext } from '@/context/app-context';
import { useTheme } from '@/context/theme-context';
import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { formatDate } from '@/utils/date';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { trips: tripList, setTrips, activities, setActivities, categories } = useAppContext();
  const { colors } = useTheme();

  const trip = tripList.find((t) => t.id === Number(id));
  if (!trip) return null;

  const tripActivities = activities
    .filter((a) => a.tripId === Number(id))
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleDelete = () => {
    Alert.alert('Delete Trip', 'This will delete the trip and all its activities. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(activitiesTable).where(eq(activitiesTable.tripId, trip.id));
          await db.delete(trips).where(eq(trips.id, trip.id));
          setActivities((prev) => prev.filter((a) => a.tripId !== trip.id));
          setTrips((prev) => prev.filter((t) => t.id !== trip.id));
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={trip.name} subtitle={trip.destination} />

        <View style={styles.tags}>
          <InfoTag label="From" value={formatDate(trip.startDate)} />
          <InfoTag label="To" value={formatDate(trip.endDate)} />
          <InfoTag label="Activities" value={String(tripActivities.length)} />
        </View>

        {trip.notes ? (
          <View style={[styles.notesBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes</Text>
            <Text style={[styles.notesText, { color: colors.text }]}>{trip.notes}</Text>
          </View>
        ) : null}

        <PrimaryButton
          label="Edit Trip"
          onPress={() => router.push({ pathname: '/trip/[id]/edit', params: { id } })}
        />
        <View style={styles.gap}>
          <PrimaryButton
            label="+ Add Activity"
            variant="secondary"
            onPress={() => router.push({ pathname: '/activity/add', params: { tripId: id } })}
          />
        </View>
        <View style={styles.gap}>
          <PrimaryButton label="Delete Trip" variant="danger" onPress={handleDelete} />
        </View>

        {tripActivities.length > 0 && (
          <View style={styles.activitiesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Activities</Text>
            {tripActivities.map((a) => {
              const cat = categories.find((c) => c.id === a.categoryId);
              return (
                <View
                  key={a.id}
                  style={[styles.activityRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.dot, { backgroundColor: cat?.color ?? '#94A3B8' }]} />
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityName, { color: colors.text }]}>{a.name}</Text>
                    <Text style={[styles.activityMeta, { color: colors.textSecondary }]}>
                      {formatDate(a.date)}{a.duration ? ` · ${a.duration} min` : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 20 },
  content: { paddingBottom: 32 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  notesBox: { borderRadius: 10, borderWidth: 1, marginBottom: 16, padding: 14 },
  notesLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  notesText: { fontSize: 14, lineHeight: 20 },
  gap: { marginTop: 10 },
  activitiesSection: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  activityRow: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 12,
  },
  dot: { borderRadius: 999, height: 10, marginRight: 10, width: 10 },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 14, fontWeight: '600' },
  activityMeta: { fontSize: 12, marginTop: 2 },
});
