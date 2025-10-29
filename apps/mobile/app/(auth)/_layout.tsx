import { Stack } from 'expo-router';
import React from 'react';

// Defines the navigation stack for the authentication flow.
export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ title: 'Set Up Your Profile' }} />
    </Stack>
  );
}
