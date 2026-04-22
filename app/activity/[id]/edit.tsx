import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { activities } from '@/db/schema';
import { useAppContext } from '@/context/app-context';
import { useTheme } from '@/context/theme-context';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';

export default function EditActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activities: activityList, categories, setActivities } = useAppContext();
  const { colors } = useTheme();

  const activity = activityList.find((a) => a.id === Number(id));

  const [name, setName] = useState(activity?.name ?? '');
  const [date, setDate] = useState(activity?.date ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(activity?.categoryId ?? null);
  const [duration, setDuration] = useState(activity?.duration ? String(activity.duration) : '');
  const [count, setCount] = useState(String(activity?.count ?? 1));
  const [notes, setNotes] = useState(activity?.notes ?? '');

  if (!activity) return null;

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

    await db
      .update(activities)
      .set({
        name: name.trim(),
        date: date.trim(),
        categoryId,
        duration: duration ? Number(duration) : null,
        count: count ? Number(count) : 1,
        notes: notes.trim() || null,
      })
      .where(eq(activities.id, activity.id));

    setActivities((prev) =>
      prev.map((a) =>
        a.id === activity.id
          ? { ...a, name: name.trim(), date: date.trim(), categoryId, duration: duration ? Number(duration) : null, count: count ? Number(count) : 1, notes: notes.trim() || null }
          : a
      )
    );
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Edit Activity" subtitle="Update activity details." />

        <View style={styles.form}>
          <FormField label="Activity Name" value={name} onChangeText={setName} />
          <FormField label="Date" value={date} onChangeText={setDate} />

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

          <FormField label="Duration (minutes, optional)" value={duration} onChangeText={setDuration} />
          <FormField label="Count" value={count} onChangeText={setCount} />
          <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
        </View>

        <PrimaryButton label="Save Changes" onPress={handleSave} />
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
