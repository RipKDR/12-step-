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
import { useRouter } from 'expo-router';
import { ActionButton, FormInput } from '@repo/ui';
import { trpc } from '../../../lib/trpc';

export default function SponsorScreen() {
  const router = useRouter();
  const [sponsorCode, setSponsorCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const { data: profile } = trpc.users.getProfile.useQuery();
  const { data: sponsorRelationship, refetch: refetchRelationship } = trpc.sponsor.getRelationship.useQuery();
  const { data: sharedContent } = trpc.sponsor.getSharedContent.useQuery();

  const generateSponsorCode = trpc.sponsor.generateCode.useMutation();
  const enterSponsorCode = trpc.sponsor.enterCode.useMutation();
  const revokeRelationship = trpc.sponsor.revokeRelationship.useMutation();

  const handleGenerateCode = async () => {
    try {
      setIsGeneratingCode(true);
      const result = await generateSponsorCode.mutateAsync();
      
      Alert.alert(
        'Sponsor Code Generated',
        `Your sponsor code is: ${result.code}\n\nShare this code with your sponsor so they can connect with you.`,
        [
          { text: 'Copy Code', onPress: () => copyToClipboard(result.code) },
          { text: 'Share Code', onPress: () => shareCode(result.code) },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Generate code error:', error);
      Alert.alert('Error', 'Unable to generate sponsor code. Please try again.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleEnterCode = async () => {
    if (!sponsorCode.trim()) {
      Alert.alert('Error', 'Please enter a sponsor code.');
      return;
    }

    try {
      await enterSponsorCode.mutateAsync({ code: sponsorCode });
      setSponsorCode('');
      await refetchRelationship();
      Alert.alert('Success', 'Successfully connected with your sponsor!');
    } catch (error) {
      console.error('Enter code error:', error);
      Alert.alert('Error', 'Invalid sponsor code. Please check and try again.');
    }
  };

  const handleRevokeRelationship = () => {
    Alert.alert(
      'Revoke Sponsor Relationship',
      'Are you sure you want to revoke your sponsor relationship? This will stop sharing your content with your sponsor.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeRelationship.mutateAsync();
              await refetchRelationship();
              Alert.alert('Success', 'Sponsor relationship revoked.');
            } catch (error) {
              console.error('Revoke error:', error);
              Alert.alert('Error', 'Unable to revoke relationship. Please try again.');
            }
          },
        },
      ]
    );
  };

  const copyToClipboard = (code: string) => {
    // In a real app, you'd use Clipboard from @react-native-clipboard/clipboard
    console.log('Code copied to clipboard:', code);
  };

  const shareCode = async (code: string) => {
    try {
      await Share.share({
        message: `Hi! I'd like to connect with you as my sponsor. Please use this code in the Recovery Companion app: ${code}`,
        title: 'Sponsor Connection Code',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const getRelationshipStatus = () => {
    if (!sponsorRelationship) return 'none';
    return sponsorRelationship.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Connected';
      case 'pending': return 'Pending';
      default: return 'Not Connected';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sponsor Management</Text>
          <Text style={styles.subtitle}>
            Connect with your sponsor and manage sharing settings
          </Text>
        </View>

        {/* Current Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Current Status</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(getRelationshipStatus()) }
              ]}
            />
            <Text style={[styles.statusText, { color: getStatusColor(getRelationshipStatus()) }]}>
              {getStatusText(getRelationshipStatus())}
            </Text>
          </View>
          
          {sponsorRelationship && (
            <View style={styles.relationshipInfo}>
              <Text style={styles.relationshipText}>
                Sponsor: {sponsorRelationship.sponsor_handle}
              </Text>
              <Text style={styles.relationshipText}>
                Connected: {new Date(sponsorRelationship.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Generate Sponsor Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Become a Sponsor</Text>
          <Text style={styles.sectionDescription}>
            Generate a code to share with sponsees who want to connect with you.
          </Text>
          
          <ActionButton
            title="Generate Sponsor Code"
            onPress={handleGenerateCode}
            loading={isGeneratingCode}
            disabled={isGeneratingCode}
            fullWidth
            accessibilityLabel="Generate sponsor code"
            accessibilityHint="Generate a code to share with sponsees"
          />
        </View>

        {/* Enter Sponsor Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect with Your Sponsor</Text>
          <Text style={styles.sectionDescription}>
            Enter the code provided by your sponsor to connect with them.
          </Text>
          
          <FormInput
            label="Sponsor Code"
            placeholder="Enter sponsor code"
            value={sponsorCode}
            onChangeText={setSponsorCode}
            autoCapitalize="characters"
            accessibilityLabel="Sponsor code input"
            accessibilityHint="Enter the code provided by your sponsor"
          />
          
          <ActionButton
            title="Connect with Sponsor"
            onPress={handleEnterCode}
            disabled={!sponsorCode.trim()}
            fullWidth
            accessibilityLabel="Connect with sponsor"
            accessibilityHint="Connect with your sponsor using the entered code"
          />
        </View>

        {/* Shared Content */}
        {sponsorRelationship && sharedContent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shared Content</Text>
            <Text style={styles.sectionDescription}>
              Content you've chosen to share with your sponsor.
            </Text>
            
            <View style={styles.sharedContentList}>
              {sharedContent.stepEntries > 0 && (
                <View style={styles.sharedItem}>
                  <Text style={styles.sharedItemText}>
                    {sharedContent.stepEntries} Step Work Entries
                  </Text>
                </View>
              )}
              {sharedContent.dailyEntries > 0 && (
                <View style={styles.sharedItem}>
                  <Text style={styles.sharedItemText}>
                    {sharedContent.dailyEntries} Daily Entries
                  </Text>
                </View>
              )}
              {sharedContent.actionPlans > 0 && (
                <View style={styles.sharedItem}>
                  <Text style={styles.sharedItemText}>
                    {sharedContent.actionPlans} Action Plans
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Revoke Relationship */}
        {sponsorRelationship && (
          <View style={styles.section}>
            <ActionButton
              title="Revoke Sponsor Relationship"
              variant="danger"
              onPress={handleRevokeRelationship}
              fullWidth
              accessibilityLabel="Revoke sponsor relationship"
              accessibilityHint="Stop sharing content with your sponsor"
            />
          </View>
        )}

        {/* Help Text */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>How It Works</Text>
          <Text style={styles.helpText}>
            • Generate a code to become a sponsor for others{'\n'}
            • Enter a sponsor's code to connect with them{'\n'}
            • Choose what content to share in each entry{'\n'}
            • Your sponsor can only see content you explicitly share{'\n'}
            • You can revoke the relationship at any time
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
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  relationshipInfo: {
    marginTop: 8,
  },
  relationshipText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  sharedContentList: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  sharedItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sharedItemText: {
    fontSize: 14,
    color: '#374151',
  },
  helpCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});
