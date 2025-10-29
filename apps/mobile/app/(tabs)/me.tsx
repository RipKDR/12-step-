import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@repo/ui';
// FIX: Use relative paths for local module imports.
import { useAuth } from '../../hooks/useAuth';

export default function MeScreen() {
  const { signOut } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile & Settings</Text>
      
      {/* TODO: Add settings sections */}
      <Text style={styles.section}>Sponsor Management (Invite/Remove)</Text>
      <Text style={styles.section}>Push Notification Settings</Text>
      <Text style={styles.section}>Privacy Toggles</Text>
      <Text style={styles.section}>Accessibility Options</Text>
      <Text style={styles.section}>Export My Data</Text>
      <Text style={styles.section}>Delete My Account</Text>

      <Button onPress={signOut} accessibilityLabel="Sign out">Sign Out</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  }
});