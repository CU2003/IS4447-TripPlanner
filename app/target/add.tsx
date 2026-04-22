import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '@/db/client';
import { targets } from '@/db/schema';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';

type Period = 'weekly' | 'monthly';
type Metric = 'count' | 'duration';

export default function AddTargetScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { trips, categories, targets: targetList, setTargets } = useAppContext();
  const { colors } = useTheme();
  const [period, setPeriod] = useState<Period>('weekly');
  const [metric, setMetric] = useState<Metric>('count');
  const [value, setValue] = useState('');
  const [tripId, setTripId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const handleSave = async () => {
    const numValue = parseInt(value);
    if (!value || isNaN(numValue) || numValue <= 0) {
      Alert.alert('Invalid target', 'Please enter a positive number.');
      return;
    }
    if (!user) return;

    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(targets)
      .values({ userId: user.id, tripId, categoryId, type: period, metric, value: numValue, createdAt: now })
      .returning();

    if (inserted) setTargets([...targetList, inserted as any]);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Add Target" subtitle="Set a goal for your trips." />

        <View style={styles.form}>
          <FormField
            label="Target value"
            value={value}
            onChangeText={setValue}
            placeholder="e.g. 10"
          />

          <Text style={[styles.fieldLabel, { color: colors.label }]}>Period</Text>
          <View style={styles.optionGrid}>
            {(['weekly', 'monthly'] as Period[]).map((p) => (
              <Pressable
                key={p}
                accessibilityLabel={`Select ${p} period`}
                accessibilityRole="button"
                onPress={() => setPeriod(p)}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: period === p ? colors.primary : colors.card,
                    borderColor: period === p ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: period === p ? '#FFFFFF' : colors.text }]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.label }]}>Metric</Text>
          <View style={styles.optionGrid}>
            {(['count', 'duration'] as Metric[]).map((m) => (
              <Pressable
                key={m}
                accessibilityLabel={`Select ${m} metric`}
                accessibilityRole="button"
                onPress={() => setMetric(m)}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: metric === m ? colors.primary : colors.card,
                    borderColor: metric === m ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: metric === m ? '#FFFFFF' : colors.text }]}>
                  {m === 'count' ? 'Activity Count' : 'Total Duration (min)'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.label }]}>Trip (optional)</Text>
          <View style={styles.optionGrid}>
            <Pressable
              accessibilityLabel="Apply to all trips"
              accessibilityRole="button"
              onPress={() => setTripId(null)}
              style={[
                styles.optionPill,
                {
                  backgroundColor: tripId === null ? colors.primary : colors.card,
                  borderColor: tripId === null ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.optionText, { color: tripId === null ? '#FFFFFF' : colors.text }]}>
                All Trips
              </Text>
            </Pressable>
            {trips.map((t) => (
              <Pressable
                key={t.id}
                accessibilityLabel={`Apply to ${t.name}`}
                accessibilityRole="button"
                onPress={() => setTripId(t.id)}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: tripId === t.id ? colors.primary : colors.card,
                    borderColor: tripId === t.id ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: tripId === t.id ? '#FFFFFF' : colors.text }]}>
                  {t.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.label }]}>Category (optional)</Text>
          <View style={styles.optionGrid}>
            <Pressable
              accessibilityLabel="Apply to all categories"
              accessibilityRole="button"
              onPress={() => setCategoryId(null)}
              style={[
                styles.optionPill,
                {
                  backgroundColor: categoryId === null ? colors.primary : colors.card,
                  borderColor: categoryId === null ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.optionText, { color: categoryId === null ? '#FFFFFF' : colors.text }]}>
                All Categories
              </Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                accessibilityLabel={`Apply to ${cat.name}`}
                accessibilityRole="button"
                onPress={() => setCategoryId(cat.id)}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: categoryId === cat.id ? cat.color : colors.card,
                    borderColor: categoryId === cat.id ? cat.color : colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: categoryId === cat.id ? '#FFFFFF' : colors.text }]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <PrimaryButton label="Save Target" onPress={handleSave} />
        <View style={styles.gap}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 20 },
  content: { paddingBottom: 32 },
  form: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  optionText: { fontSize: 13, fontWeight: '500' },
  gap: { marginTop: 10 },
});
