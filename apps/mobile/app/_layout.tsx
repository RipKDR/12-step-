import React from 'react';
// FIX: Use relative paths for local module imports.
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { TRPCProvider } from '../lib/trpc';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * This component is the main navigator. It decides which screen to show based on
 * the authentication state. This is a more robust pattern than using redirects
 * at the root level.
 */
function RootLayoutNav() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {session ? (
        // User is signed in, show the main app tabs.
        <Stack.Screen name="(tabs)" />
      ) : (
        // User is not signed in, show the auth flow.
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

// This is the root entry point for the Expo app.
// It wraps the entire application in necessary context providers.
export default function RootLayout() {
  return (
    <AuthProvider>
      <TRPCProvider>
        <RootLayoutNav />
      </TRPCProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
});