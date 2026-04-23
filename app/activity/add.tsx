import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '@/db/client';
import { activities } from '@/db/schema';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';

// form to add a new activity to a trip, category is picked using the pills
export default function AddActivityScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { categories, activities: activityList, setActivities } = useAppContext();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [duration, setDuration] = useState('');
  const [count, setCount] = useState('1');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter an activity name.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Missing date', 'Please enter a date.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Missing category', 'Please select a category.');
      return;
    }
    if (!user) return;

    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(activities)
      .values({
        userId: user.id,
        tripId: Number(tripId),
        categoryId,
        name: name.trim(),
        date: date.trim(),
        duration: duration ? Number(duration) : null,
        count: count ? Number(count) : 1,
        notes: notes.trim() || null,
        createdAt: now,
      })
      .returning();

    // saves the activty and updates context so it apears without refreshing
    if (inserted) setActivities([...activityList, inserted as any]);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Add Activity" subtitle="Record an activity for this trip." />

        <View style={styles.form}>
          <FormField label="Activity Name" value={name} onChangeText={setName} placeholder="e.g. Eiffel Tower Visit" />
          <FormField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

          <Text style={[styles.fieldLabel, { color: colors.label }]}>Category</Text>
          <View style={styles.optionGrid}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                accessibilityLabel={`Select category ${cat.name}`}
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

          <FormField label="Duration (minutes, optional)" value={duration} onChangeText={setDuration} placeholder="e.g. 90" />
          <FormField label="Count" value={count} onChangeText={setCount} placeholder="e.g. 1" />
          <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any details…" multiline />
        </View>

        <PrimaryButton label="Save Activity" onPress={handleSave} />
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
