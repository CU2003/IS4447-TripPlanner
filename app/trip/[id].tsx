import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

// shows the details of a trip and lists all its activites, can also delete from here
export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { trips: tripList, setTrips, activities, setActivities, categories } = useAppContext();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const trip = tripList.find((t) => t.id === Number(id));
  if (!trip) return null;

  const normalized = searchQuery.trim().toLowerCase();

  // filters and sorts the activites for this trip
  const tripActivities = activities
    .filter((a) => {
      if (a.tripId !== Number(id)) return false;
      if (selectedCategoryId !== null && a.categoryId !== selectedCategoryId) return false;
      if (normalized.length > 0 && !a.name.toLowerCase().includes(normalized)) return false;
      return true;
    })
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

        {activities.filter((a) => a.tripId === Number(id)).length > 0 && (
          <View style={styles.activitiesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Activities</Text>

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search activities…"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Search activities"
              style={[styles.searchInput, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder, color: colors.text }]}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
              <Pressable
                accessibilityLabel="Show all categories"
                accessibilityRole="button"
                onPress={() => setSelectedCategoryId(null)}
                style={[styles.filterPill, { backgroundColor: selectedCategoryId === null ? colors.primary : colors.card, borderColor: selectedCategoryId === null ? colors.primary : colors.border }]}
              >
                <Text style={[styles.filterText, { color: selectedCategoryId === null ? '#FFFFFF' : colors.text }]}>All</Text>
              </Pressable>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  accessibilityLabel={`Filter by ${cat.name}`}
                  accessibilityRole="button"
                  onPress={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                  style={[styles.filterPill, { backgroundColor: selectedCategoryId === cat.id ? cat.color : colors.card, borderColor: selectedCategoryId === cat.id ? cat.color : colors.border }]}
                >
                  <Text style={[styles.filterText, { color: selectedCategoryId === cat.id ? '#FFFFFF' : colors.text }]}>{cat.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {tripActivities.map((a) => {
              const cat = categories.find((c) => c.id === a.categoryId);
              return (
                <Pressable
                  key={a.id}
                  accessibilityLabel={`Edit ${a.name}`}
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: '/activity/[id]/edit', params: { id: a.id.toString() } })}
                  style={({ pressed }) => [
                    styles.activityRow,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    pressed && styles.activityRowPressed,
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: cat?.color ?? '#94A3B8' }]} />
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityName, { color: colors.text }]}>{a.name}</Text>
                    <Text style={[styles.activityMeta, { color: colors.textSecondary }]}>
                      {formatDate(a.date)}{a.duration ? ` · ${a.duration} min` : ''}
                    </Text>
                  </View>
                </Pressable>
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
  searchInput: { borderRadius: 10, borderWidth: 1, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 10 },
  filterRow: { marginBottom: 10 },
  filterContent: { gap: 8, paddingBottom: 4 },
  filterPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
  filterText: { fontSize: 13, fontWeight: '500' },
  dot: { borderRadius: 999, height: 10, marginRight: 10, width: 10 },
  activityInfo: { flex: 1 },
  activityRowPressed: { opacity: 0.88 },
  activityName: { fontSize: 14, fontWeight: '600' },
  activityMeta: { fontSize: 12, marginTop: 2 },
});
