import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StepWorkScreen() {
  // This screen will list the 12 steps and allow users to work on them.
  // It will use tRPC procedures to fetch questions and save responses.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step Work</Text>
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
