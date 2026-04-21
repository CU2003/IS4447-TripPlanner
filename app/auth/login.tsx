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
import { appSettings, users } from '@/db/schema';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const found = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim().toLowerCase()));

      if (found.length === 0 || found[0].password !== password) {
        Alert.alert('Login failed', 'Invalid email or password.');
        return;
      }

      const u = found[0];

      const existing = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.key, 'current_user_id'));

      if (existing.length > 0) {
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
            Plan your adventures, one trip at a time.
          </Text>

          <View style={styles.form}>
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
              placeholder="••••••••"
              secureTextEntry
            />
          </View>

          <PrimaryButton label={loading ? 'Signing in…' : 'Sign In'} onPress={handleLogin} />

          <View style={styles.registerRow}>
            <Text style={[styles.registerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/auth/register')}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>Register</Text>
            </Pressable>
          </View>

          <View style={styles.demoBox}>
            <Text style={[styles.demoTitle, { color: colors.textSecondary }]}>Demo account</Text>
            <Text style={[styles.demoCredentials, { color: colors.text }]}>
              Email: demo@example.com{'\n'}Password: password123
            </Text>
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
  registerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '600' },
  demoBox: {
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    marginTop: 32,
    padding: 14,
  },
  demoTitle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  demoCredentials: { fontSize: 13 },
});
