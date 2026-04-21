import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import ScreenHeader from '@/components/ui/screen-header';

export default function InsightsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Insights" subtitle="Your trip statistics" />
      <View style={styles.placeholder}>
        <Text style={styles.emoji}>📊</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>Add activities to see insights</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  placeholder: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  emoji: { fontSize: 48, marginBottom: 12 },
  text: { fontSize: 16 },
});
