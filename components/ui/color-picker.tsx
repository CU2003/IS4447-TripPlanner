import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/theme-context';

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981',
  '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899',
  '#6B7280', '#0F766E', '#1D4ED8', '#7C3AED',
];

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export default function ColorPicker({ value, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.label }]}>Color</Text>
      <View style={styles.grid}>
        {PRESET_COLORS.map((color) => (
          <Pressable
            key={color}
            accessibilityLabel={`Select color ${color}`}
            accessibilityRole="button"
            onPress={() => onChange(color)}
            style={[
              styles.swatch,
              { backgroundColor: color },
              value === color && styles.selected,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { borderRadius: 999, height: 34, width: 34 },
  selected: { borderColor: '#0F172A', borderWidth: 3 },
});
