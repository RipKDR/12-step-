import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DailyScreen() {
  // This screen is for daily check-ins, gratitude lists, and journal entries.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Entry</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
