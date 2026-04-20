import { View, Text, StyleSheet } from 'react-native';

export default function EditTripScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Edit Trip — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, color: '#475569' },
});
