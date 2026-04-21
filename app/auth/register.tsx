import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { appSettings, categories, users } from '@/db/schema';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim().toLowerCase()));

      if (existing.length > 0) {
        Alert.alert('Email taken', 'An account with that email already exists.');
        return;
      }

      const now = new Date().toISOString();
      await db.insert(users).values({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        createdAt: now,
      });

      const newUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim().toLowerCase()));
      const u = newUser[0];

      await db.insert(categories).values([
        { userId: u.id, name: 'Sightseeing', color: '#E74C3C', icon: 'binoculars', createdAt: now },
        { userId: u.id, name: 'Outdoor', color: '#27AE60', icon: 'walk', createdAt: now },
        { userId: u.id, name: 'Food & Drink', color: '#F39C12', icon: 'restaurant', createdAt: now },
        { userId: u.id, name: 'Transport', color: '#3498DB', icon: 'bus', createdAt: now },
      ]);

      const sessionRows = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.key, 'current_user_id'));

      if (sessionRows.length > 0) {
        await db
          .update(appSettings)
          .set({ value: String(u.id) })
          .where(eq(appSettings.key, 'current_user_id'));
      } else {
        await db.insert(appSettings).values({ key: 'current_user_id', value: String(u.id) });
      }

      setUser({ id: u.id, email: u.email, name: u.name });
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.logoRow}>
            <Text style={styles.logoEmoji}>✈️</Text>
            <Text style={[styles.appName, { color: colors.primary }]}>TripPlanner</Text>
          </View>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Create your account and start planning.
          </Text>

          <View style={styles.form}>
            <FormField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
            />
            <FormField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 characters"
              secureTextEntry
            />
          </View>

          <PrimaryButton
            label={loading ? 'Creating account…' : 'Create Account'}
            onPress={handleRegister}
          />

          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 24, paddingTop: 48 },
  logoRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 8 },
  logoEmoji: { fontSize: 32 },
  appName: { fontSize: 32, fontWeight: '800' },
  tagline: { fontSize: 15, marginBottom: 40 },
  form: { marginBottom: 12 },
  loginRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: '600' },
});
