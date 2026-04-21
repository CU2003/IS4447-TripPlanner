import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TripCard from '@/components/TripCard';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useAppContext } from '@/context/app-context';
import { useTheme } from '@/context/theme-context';

export default function TripsScreen() {
  const router = useRouter();
  const { trips, activities } = useAppContext();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const normalized = searchQuery.trim().toLowerCase();

  const filtered = trips.filter(
    (t) =>
      normalized.length === 0 ||
      t.name.toLowerCase().includes(normalized) ||
      t.destination.toLowerCase().includes(normalized)
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="TripPlanner"
        subtitle={`${trips.length} trip${trips.length !== 1 ? 's' : ''}`}
      />

      <PrimaryButton label="+ Add Trip" onPress={() => router.push('/trip/add')} />

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search trips…"
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel="Search trips"
        style={[styles.searchInput, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder, color: colors.text }]}
      />

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✈️</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No trips yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {trips.length === 0 ? 'Tap "+ Add Trip" to get started.' : 'No trips match your search.'}
            </Text>
          </View>
        ) : (
          filtered.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              activityCount={activities.filter((a) => a.tripId === trip.id).length}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  searchInput: { borderRadius: 10, borderWidth: 1, marginTop: 14, paddingHorizontal: 12, paddingVertical: 10 },
  listContent: { paddingBottom: 24, paddingTop: 14 },
  emptyState: { alignItems: 'center', paddingTop: 48 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});
