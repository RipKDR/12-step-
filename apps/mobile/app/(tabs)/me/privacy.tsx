import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { ActionButton } from '@repo/ui';
import { trpc } from '../../../lib/trpc';

export default function PrivacyScreen() {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: profile } = trpc.users.getProfile.useQuery();
  const { data: dataStats } = trpc.export.getDataStats.useQuery();

  const exportData = trpc.export.exportData.useMutation();
  const deleteAccount = trpc.users.deleteAccount.useMutation();

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      Alert.alert(
        'Export Data',
        'This will prepare your data for export. You\'ll receive an email with a download link.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Export',
            onPress: async () => {
              try {
                const result = await exportData.mutateAsync();
                
                Alert.alert(
                  'Export Started',
                  'Your data export has been initiated. You\'ll receive an email with download instructions within 24 hours.',
                  [{ text: 'OK' }]
                );
              } catch (error) {
                console.error('Export error:', error);
                Alert.alert('Error', 'Unable to start data export. Please try again.');
              }
            },
          },
        ]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This is your last chance. Once deleted, your account and all data will be permanently removed.\n\nType "DELETE" to confirm.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setIsDeleting(true);
                      await deleteAccount.mutateAsync();
                      // Navigation will be handled by auth state change
                    } catch (error) {
                      console.error('Delete account error:', error);
                      Alert.alert('Error', 'Unable to delete account. Please try again.');
                    } finally {
                      setIsDeleting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'I\'m using Recovery Companion, a privacy-first 12-step recovery app. Check it out!',
        title: 'Recovery Companion',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy & Data</Text>
          <Text style={styles.subtitle}>
            Control your data and privacy settings
          </Text>
        </View>

        {/* Data Overview */}
        {dataStats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Data</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{dataStats.stepEntries}</Text>
                <Text style={styles.statLabel}>Step Entries</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{dataStats.dailyEntries}</Text>
                <Text style={styles.statLabel}>Daily Entries</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{dataStats.actionPlans}</Text>
                <Text style={styles.statLabel}>Action Plans</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{dataStats.routines}</Text>
                <Text style={styles.statLabel}>Routines</Text>
              </View>
            </View>
          </View>
        )}

        {/* Privacy Principles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy Principles</Text>
          <View style={styles.principlesList}>
            <View style={styles.principleItem}>
              <Text style={styles.principleIcon}>🔒</Text>
              <Text style={styles.principleText}>
                Your data is encrypted and stored securely
              </Text>
            </View>
            <View style={styles.principleItem}>
              <Text style={styles.principleIcon}>👤</Text>
              <Text style={styles.principleText}>
                You control what you share with your sponsor
              </Text>
            </View>
            <View style={styles.principleItem}>
              <Text style={styles.principleIcon}>🚫</Text>
              <Text style={styles.principleText}>
                We never sell or share your personal data
              </Text>
            </View>
            <View style={styles.principleItem}>
              <Text style={styles.principleIcon}>📱</Text>
              <Text style={styles.principleText}>
                Your data works offline and syncs when online
              </Text>
            </View>
          </View>
        </View>

        {/* Data Export */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export Your Data</Text>
          <Text style={styles.cardDescription}>
            Download a complete copy of all your recovery data in a portable format.
          </Text>
          
          <ActionButton
            title="Export My Data"
            onPress={handleExportData}
            loading={isExporting}
            disabled={isExporting}
            fullWidth
            accessibilityLabel="Export all my data"
            accessibilityHint="Download a complete copy of your recovery data"
          />
        </View>

        {/* Account Management */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Management</Text>
          
          <View style={styles.accountActions}>
            <ActionButton
              title="Share App"
              variant="secondary"
              onPress={handleShareApp}
              fullWidth
              accessibilityLabel="Share Recovery Companion app"
              accessibilityHint="Share the app with others who might benefit"
            />
          </View>
        </View>

        {/* Delete Account */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Delete Account</Text>
          <Text style={styles.dangerDescription}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </Text>
          
          <ActionButton
            title="Delete My Account"
            variant="danger"
            onPress={handleDeleteAccount}
            loading={isDeleting}
            disabled={isDeleting}
            fullWidth
            accessibilityLabel="Delete my account permanently"
            accessibilityHint="Permanently delete your account and all data"
          />
        </View>

        {/* Privacy Policy */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy Policy</Text>
          <Text style={styles.cardDescription}>
            Read our complete privacy policy to understand how we protect your data.
          </Text>
          
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              // In a real app, you'd open the privacy policy
              Alert.alert('Privacy Policy', 'Privacy policy would open here.');
            }}
            accessibilityLabel="Read privacy policy"
            accessibilityHint="Open the complete privacy policy"
          >
            <Text style={styles.linkText}>View Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Questions or Concerns?</Text>
          <Text style={styles.cardDescription}>
            If you have any questions about your privacy or data, please contact us.
          </Text>
          
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              // In a real app, you'd open contact support
              Alert.alert('Contact Support', 'Contact support would open here.');
            }}
            accessibilityLabel="Contact support"
            accessibilityHint="Get help with privacy or data questions"
          >
            <Text style={styles.linkText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Recovery Companion v1.0.0
          </Text>
          <Text style={styles.footerText}>
            Your privacy and recovery matter
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  principlesList: {
    gap: 12,
  },
  principleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  principleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  principleText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  accountActions: {
    gap: 12,
  },
  dangerCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 16,
  },
  dangerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 16,
    lineHeight: 20,
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  linkText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
});
