import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlansScreen() {
  // Here, users can create "Action Plans" for specific locations (e.g., "Home", "Work").
  // These plans are surfaced by the geofencing background task.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Action Plans</Text>
      <Text>Define plans for when you enter specific locations.</Text>
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
