import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { useAppContext } from '@/context/app-context';
import { useTheme } from '@/context/theme-context';
import ScreenHeader from '@/components/ui/screen-header';
import PrimaryButton from '@/components/ui/primary-button';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories: cats, setCategories, activities } = useAppContext();
  const { colors } = useTheme();

  const handleDelete = (id: number) => {
    const inUse = activities.some((a) => a.categoryId === id);
    if (inUse) {
      Alert.alert('Cannot delete', 'This category is used by one or more activities.');
      return;
    }
    Alert.alert('Delete Category', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(categories).where(eq(categories.id, id));
          setCategories((prev) => prev.filter((c) => c.id !== id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Categories" subtitle={`${cats.length} categories`} />

      <PrimaryButton label="+ Add Category" onPress={() => router.push('/category/add')} />
      <PrimaryButton label="← Back" variant="secondary" onPress={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {cats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏷️</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No categories yet</Text>
          </View>
        ) : (
          cats.map((cat) => (
            <View
              key={cat.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  accessibilityLabel={`Edit ${cat.name}`}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({ pathname: '/category/[id]/edit', params: { id: cat.id.toString() } })
                  }
                  style={[styles.actionBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={`Delete ${cat.name}`}
                  accessibilityRole="button"
                  onPress={() => handleDelete(cat.id)}
                  style={[styles.actionBtn, { borderColor: '#FCA5A5' }]}
                >
                  <Text style={[styles.actionText, { color: '#7F1D1D' }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  content: { paddingBottom: 32, paddingTop: 14 },
  card: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 14,
  },
  cardLeft: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  colorDot: { borderRadius: 999, height: 16, width: 16 },
  catName: { fontSize: 15, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  actionText: { fontSize: 13, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingTop: 48 },
  emptyEmoji: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
});
