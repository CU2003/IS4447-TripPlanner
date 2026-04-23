import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { appSettings, activities, targets, trips, categories, users } from '@/db/schema';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { useAppContext } from '@/context/app-context';
import ScreenHeader from '@/components/ui/screen-header';
import PrimaryButton from '@/components/ui/primary-button';
import { exportActivitiesToCSV } from '@/utils/csv';

// profile screen with account info, settings and data managment options
export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const { setTrips, setActivities, setCategories, setTargets, activities: activityList, trips: tripList, categories: categoryList } = useAppContext();
  const router = useRouter();

  const handleExport = async () => {
    try {
      await exportActivitiesToCSV(activityList, tripList, categoryList);
    } catch {
      Alert.alert('Export failed', 'Could not export activities.');
    }
  };

  const handleLogout = async () => {
    const rows = await db.select().from(appSettings).where(eq(appSettings.key, 'current_user_id'));
    if (rows.length > 0) {
      await db.delete(appSettings).where(eq(appSettings.key, 'current_user_id'));
    }
    setUser(null);
    router.replace('/auth/login');
  };

  // deletes all the users data from every table then logs them out
  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            await db.delete(activities).where(eq(activities.userId, user.id));
            await db.delete(targets).where(eq(targets.userId, user.id));
            await db.delete(trips).where(eq(trips.userId, user.id));
            await db.delete(categories).where(eq(categories.userId, user.id));
            await db.delete(users).where(eq(users.id, user.id));
            const rows = await db.select().from(appSettings).where(eq(appSettings.key, 'current_user_id'));
            if (rows.length > 0) {
              await db.delete(appSettings).where(eq(appSettings.key, 'current_user_id'));
            }
            setUser(null);
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Profile" subtitle="Your account & settings" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
          <View style={[styles.memberBadge, { backgroundColor: colors.primary + '18' }]}>
            <Text style={[styles.memberText, { color: colors.primary }]}>TripPlanner Member</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
          <PrimaryButton
            label="Manage Categories"
            variant="secondary"
            onPress={() => router.push('/category')}
          />
          <View style={styles.buttonSpacing}>
            <PrimaryButton
              label="Manage Targets"
              variant="secondary"
              onPress={() => router.push('/target')}
            />
          </View>
          <View style={styles.buttonSpacing}>
            <PrimaryButton
              label="Export Activities (CSV)"
              variant="secondary"
              onPress={handleExport}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <PrimaryButton label="Log Out" variant="secondary" onPress={handleLogout} />
          <View style={styles.buttonSpacing}>
            <PrimaryButton label="Delete Account" variant="danger" onPress={handleDeleteProfile} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  content: { paddingBottom: 40, paddingTop: 4 },
  card: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    padding: 24,
  },
  avatarCircle: {
    alignItems: 'center',
    borderRadius: 999,
    height: 72,
    justifyContent: 'center',
    marginBottom: 12,
    width: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  userName: { fontSize: 20, fontWeight: '700', marginTop: 2 },
  userEmail: { fontSize: 14, marginTop: 4 },
  memberBadge: { borderRadius: 999, marginTop: 10, paddingHorizontal: 14, paddingVertical: 5 },
  memberText: { fontSize: 12, fontWeight: '600' },
  section: { borderRadius: 14, borderWidth: 1, marginBottom: 16, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  settingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  settingLabel: { fontSize: 15 },
  buttonSpacing: { marginTop: 10 },
});
