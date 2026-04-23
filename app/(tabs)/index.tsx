import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TripCard from '@/components/TripCard';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useAppContext } from '@/context/app-context';
import { useTheme } from '@/context/theme-context';

// main screen that shows all the users trips with search and category filtering
export default function TripsScreen() {
  const router = useRouter();
  const { trips, activities, categories } = useAppContext();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // filters trips based on the search text and selected category
  const normalized = searchQuery.trim().toLowerCase();

  const filtered = trips.filter((t) => {
    const matchesSearch =
      normalized.length === 0 ||
      t.name.toLowerCase().includes(normalized) ||
      t.destination.toLowerCase().includes(normalized);
    const matchesCategory =
      selectedCategoryId === null ||
      activities.some((a) => a.tripId === t.id && a.categoryId === selectedCategoryId);
    return matchesSearch && matchesCategory;
  });

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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        <Pressable
          accessibilityLabel="Show all categories"
          accessibilityRole="button"
          onPress={() => setSelectedCategoryId(null)}
          style={[
            styles.filterPill,
            {
              backgroundColor: selectedCategoryId === null ? colors.primary : colors.card,
              borderColor: selectedCategoryId === null ? colors.primary : colors.border,
            },
          ]}
        >
          <Text style={[styles.filterText, { color: selectedCategoryId === null ? '#FFFFFF' : colors.text }]}>
            All
          </Text>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            accessibilityLabel={`Filter by ${cat.name}`}
            accessibilityRole="button"
            onPress={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
            style={[
              styles.filterPill,
              {
                backgroundColor: selectedCategoryId === cat.id ? cat.color : colors.card,
                borderColor: selectedCategoryId === cat.id ? cat.color : colors.border,
              },
            ]}
          >
            <Text style={[styles.filterText, { color: selectedCategoryId === cat.id ? '#FFFFFF' : colors.text }]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
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
  filterRow: { marginTop: 10, flexGrow: 0 },
  filterContent: { gap: 8, paddingBottom: 4, alignItems: 'center' },
  filterPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start' },
  filterText: { fontSize: 13, fontWeight: '500' },
  listContent: { paddingBottom: 24, paddingTop: 14 },
  emptyState: { alignItems: 'center', paddingTop: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});
