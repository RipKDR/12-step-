import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@repo/ui';

export default function ProfileSetupScreen() {
  // TODO: Implement form to collect user's name and timezone.
  // Timezone is critical for scheduling routine nudges and check-ins accurately.

  const handleCompleteSetup = () => {
    // 1. Save profile information to Supabase
    // 2. Redirect to the main app
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>One last step...</Text>
      <Text style={styles.body}>Please select your timezone. This helps us send you reminders at the right time of day.</Text>
      {/* Placeholder for a timezone picker */}
      <View style={styles.pickerPlaceholder}>
        <Text>Timezone Picker Goes Here</Text>
      </View>
      <Button onPress={handleCompleteSetup} accessibilityLabel="Complete setup button">
        Complete Setup
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  pickerPlaceholder: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
});
