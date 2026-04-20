import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Trip } from '../_layout';

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(AppContext);

  if (!context) return null;

  const { trips } = context;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="My Trips"
        subtitle={`${trips.length} trip${trips.length !== 1 ? 's' : ''}`}
      />

      <PrimaryButton
        label="Add Trip"
        onPress={() => router.push({ pathname: '../add' })}
      />

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {trips.length === 0 ? (
          <Text style={styles.emptyText}>No trips yet. Add your first trip!</Text>
        ) : (
          trips.map((trip: Trip) => (
            <View key={trip.id} style={styles.card}>
              <Text style={styles.cardTitle}>{trip.name}</Text>
              <Text style={styles.cardSubtitle}>{trip.destination}</Text>
              <Text style={styles.cardDates}>
                {trip.startDate} → {trip.endDate}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 14,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
  },
  cardDates: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
  },
  emptyText: {
    color: '#475569',
    fontSize: 16,
    paddingTop: 8,
    textAlign: 'center',
  },
});
