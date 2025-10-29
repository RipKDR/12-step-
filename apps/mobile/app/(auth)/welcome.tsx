import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@repo/ui';

export default function WelcomeScreen() {
  // TODO: Implement Supabase email/password and social logins
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your Companion</Text>
      <Text style={styles.subtitle}>A private, secure space for your recovery journey.</Text>
      <Button
        accessibilityLabel="Sign in button"
        onPress={() => {
          // This is a placeholder navigation. In a real app, this would
          // trigger the sign-in flow and redirect upon success.
          router.replace('/(tabs)/home');
        }}
      >
        Sign In (Placeholder)
      </Button>
      <Button
        accessibilityLabel="Sign up button"
        onPress={() => router.push('/profile-setup')}
      >
        Sign Up (Placeholder)
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
});
