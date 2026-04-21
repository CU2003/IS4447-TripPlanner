import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import ColorPicker from '@/components/ui/color-picker';

const ICONS = ['heart', 'walk', 'book', 'leaf', 'star', 'home', 'briefcase', 'restaurant', 'bicycle', 'camera'];

export default function AddCategoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { categories: catList, setCategories } = useAppContext();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('heart');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a category name.');
      return;
    }
    if (!user) return;

    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(categories)
      .values({ userId: user.id, name: name.trim(), color, icon, createdAt: now })
      .returning();

    if (inserted) setCategories([...catList, inserted]);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Add Category" subtitle="Create a new category." />

        <View style={styles.form}>
          <FormField label="Name" value={name} onChangeText={setName} placeholder="e.g. Sightseeing" />
          <ColorPicker value={color} onChange={setColor} />

          <Text style={[styles.fieldLabel, { color: colors.label }]}>Icon</Text>
          <View style={styles.iconGrid}>
            {ICONS.map((ic) => (
              <Pressable
                key={ic}
                accessibilityLabel={`Select icon ${ic}`}
                accessibilityRole="button"
                onPress={() => setIcon(ic)}
                style={[
                  styles.iconPill,
                  {
                    backgroundColor: icon === ic ? color : colors.card,
                    borderColor: icon === ic ? color : colors.border,
                  },
                ]}
              >
                <Text style={[styles.iconText, { color: icon === ic ? '#FFFFFF' : colors.text }]}>
                  {ic}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <PrimaryButton label="Save Category" onPress={handleSave} />
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
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  iconPill: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  iconText: { fontSize: 12 },
  gap: { marginTop: 10 },
});
