import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { trips } from '@/db/schema';
import { useAppContext } from '@/context/app-context';
import { useTheme } from '@/context/theme-context';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';

// pre-fills the form with the existing trip data so the user can edit it
export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { trips: tripList, setTrips } = useAppContext();
  const { colors } = useTheme();

  const trip = tripList.find((t) => t.id === Number(id));

  const [name, setName] = useState(trip?.name ?? '');
  const [destination, setDestination] = useState(trip?.destination ?? '');
  const [startDate, setStartDate] = useState(trip?.startDate ?? '');
  const [endDate, setEndDate] = useState(trip?.endDate ?? '');
  const [notes, setNotes] = useState(trip?.notes ?? '');

  if (!trip) return null;

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

    await db
      .update(trips)
      .set({
        name: name.trim(),
        destination: destination.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        notes: notes.trim() || null,
      })
      .where(eq(trips.id, trip.id));

    // updates context so the changes show up without needing to refetch from db
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? { ...t, name: name.trim(), destination: destination.trim(), startDate: startDate.trim(), endDate: endDate.trim(), notes: notes.trim() || null }
          : t
      )
    );
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Edit Trip" subtitle="Update trip details." />

        <View style={styles.form}>
          <FormField label="Trip Name" value={name} onChangeText={setName} />
          <FormField label="Destination" value={destination} onChangeText={setDestination} />
          <FormField label="Start Date" value={startDate} onChangeText={setStartDate} />
          <FormField label="End Date" value={endDate} onChangeText={setEndDate} />
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
  gap: { marginTop: 10 },
});
