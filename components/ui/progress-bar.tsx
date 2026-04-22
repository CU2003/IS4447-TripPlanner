import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/theme-context';

type Props = {
  label: string;
  current: number;
  target: number;
  period: string;
};

export default function ProgressBar({ label, current, target, period }: Props) {
  const { colors } = useTheme();
  const pct = Math.min(current / Math.max(target, 1), 1);
  const exceeded = current >= target;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.period, { color: colors.textSecondary }]}>
          {period.charAt(0).toUpperCase() + period.slice(1)}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(pct * 100)}%`, backgroundColor: exceeded ? '#10B981' : colors.primary },
          ]}
        />
      </View>

      <View style={styles.bottomRow}>
        <Text style={[styles.count, { color: colors.text }]}>
          {current} / {target}
        </Text>
        {exceeded ? (
          <Text style={styles.exceededText}>Target met! ✓</Text>
        ) : (
          <Text style={[styles.remaining, { color: colors.textSecondary }]}>
            {target - current} remaining
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  period: {
    fontSize: 12,
  },
  track: {
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
    height: 8,
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  count: {
    fontSize: 13,
    fontWeight: '500',
  },
  remaining: {
    fontSize: 12,
  },
  exceededText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
});
