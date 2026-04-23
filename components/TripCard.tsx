import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Trip } from '@/context/app-context';
import { useTheme } from '@/context/theme-context';
import { formatDate } from '@/utils/date';

type Props = {
  trip: Trip;
  activityCount: number;
};

// card component shown on the home screen for each trip
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
      {/* coloured bar on the left side of each card */}
      <View style={[styles.accent, { backgroundColor: colors.primary }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{trip.name}</Text>
          <View style={[styles.countBadge, { backgroundColor: colors.primary + '22' }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>
              {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{trip.destination}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.88,
  },
  accent: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
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
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
  },
});
