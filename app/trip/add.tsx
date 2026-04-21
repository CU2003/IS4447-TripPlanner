import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '@/db/client';
import { trips } from '@/db/schema';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';

export default function AddTripScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { trips: tripList, setTrips } = useAppContext();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a trip name.');
      return;
    }
    if (!destination.trim()) {
      Alert.alert('Missing destination', 'Please enter a destination.');
      return;
    }
    if (!startDate.trim() || !endDate.trim()) {
      Alert.alert('Missing dates', 'Please enter both start and end dates.');
      return;
    }
    if (!user) return;

    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(trips)
      .values({
        userId: user.id,
        name: name.trim(),
        destination: destination.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        notes: notes.trim() || null,
        createdAt: now,
      })
      .returning();

    if (inserted) setTrips([...tripList, inserted as any]);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Add Trip" subtitle="Plan a new adventure." />

        <View style={styles.form}>
          <FormField label="Trip Name" value={name} onChangeText={setName} placeholder="e.g. Summer in Paris" />
          <FormField label="Destination" value={destination} onChangeText={setDestination} placeholder="e.g. Paris, France" />
          <FormField label="Start Date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
          <FormField label="End Date" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
          <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any details…" multiline />
        </View>

        <PrimaryButton label="Save Trip" onPress={handleSave} />
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
  gap: { marginTop: 10 },
});
