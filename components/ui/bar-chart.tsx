import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/theme-context';

type DataPoint = {
  label: string;
  value: number;
};

type Props = {
  data: DataPoint[];
  title?: string;
  height?: number;
};

export default function BarChart({ data, title, height = 160 }: Props) {
  const { colors } = useTheme();
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {title ? (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      ) : null}

      <View style={[styles.chart, { height }]}>
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * (height - 32);
          return (
            <View key={index} style={styles.barWrapper}>
              <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
                {point.value > 0 ? point.value : ''}
              </Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, point.value > 0 ? 4 : 0),
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>{point.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    width: '60%',
  },
  bar: {
    borderRadius: 4,
    width: '100%',
  },
  axisLabel: {
    fontSize: 11,
    marginTop: 4,
  },
});
