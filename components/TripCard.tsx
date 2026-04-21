import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Trip } from '@/context/app-context';
import { useTheme } from '@/context/theme-context';
import { formatDate } from '@/utils/date';

type Props = {
  trip: Trip;
  activityCount: number;
};

export default function TripCard({ trip, activityCount }: Props) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityLabel={`${trip.name}, ${trip.destination}, view details`}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/trip/[id]', params: { id: trip.id.toString() } })}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.name, { color: colors.text }]}>{trip.name}</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>
            {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
          </Text>
        </View>
      </View>

      <Text style={[styles.destination, { color: colors.textSecondary }]}>{trip.destination}</Text>

      <View style={styles.bottomRow}>
        <Text style={[styles.dates, { color: colors.textSecondary }]}>
          {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.88,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  countBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  destination: {
    fontSize: 14,
    marginTop: 4,
  },
  bottomRow: {
    marginTop: 10,
  },
  dates: {
    fontSize: 13,
  },
});
