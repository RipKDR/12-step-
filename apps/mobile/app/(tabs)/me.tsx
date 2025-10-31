import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '@repo/ui';
import { useAuth } from '../../hooks/useAuth';
import { trpc } from '../../lib/trpc';

export default function MeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const { data: profile, isLoading, refetch } = trpc.users.getProfile.useQuery();
  const { data: sobrietyStats } = trpc.users.getSobrietyStats.useQuery();

  const handleSignOut = () => {
    signOut();
  };

  const handleSettingsPress = (screen: string) => {
    router.push(`/(tabs)/me/${screen}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.handle?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.greeting}>
              {getGreeting()}, {profile?.handle || 'Friend'}
            </Text>
            <Text style={styles.program}>{profile?.program}</Text>
            {sobrietyStats && (
              <Text style={styles.streak}>
                {sobrietyStats.currentStreakDays} days sober
              </Text>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Recovery Journey</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sobrietyStats?.currentStreakDays || 0}</Text>
              <Text style={styles.statLabel}>Days Sober</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.timezone || 'N/A'}</Text>
              <Text style={styles.statLabel}>Timezone</Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Recovery Tools</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingsPress('sponsor')}
            accessibilityLabel="Sponsor management"
            accessibilityHint="Manage your sponsor relationship and sharing settings"
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>🤝</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Sponsor Management</Text>
              <Text style={styles.settingDescription}>
                Connect with your sponsor and manage sharing
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingsPress('routines')}
            accessibilityLabel="Routines"
            accessibilityHint="Manage your daily and weekly routines"
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>⏰</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Routines</Text>
              <Text style={styles.settingDescription}>
                Set up daily and weekly recovery routines
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingsPress('triggers')}
            accessibilityLabel="Trigger locations"
            accessibilityHint="Manage geofenced trigger locations"
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>📍</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Trigger Locations</Text>
              <Text style={styles.settingDescription}>
                Set up location-based triggers and action plans
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingsPress('meetings')}
            accessibilityLabel="Meeting finder"
            accessibilityHint="Find nearby NA and AA meetings"
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>🏛️</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Meeting Finder</Text>
              <Text style={styles.settingDescription}>
                Find nearby NA and AA meetings
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Support & Resources</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingsPress('support')}
            accessibilityLabel="Support tools"
            accessibilityHint="Access breathing exercises and crisis resources"
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>🆘</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Support Tools</Text>
              <Text style={styles.settingDescription}>
                Breathing exercises, grounding, and crisis resources
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingsPress('privacy')}
            accessibilityLabel="Privacy settings"
            accessibilityHint="Manage your data and privacy settings"
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>🔒</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy & Data</Text>
              <Text style={styles.settingDescription}>
                Export your data and manage privacy settings
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <ActionButton
            title="Sign Out"
            variant="danger"
            onPress={handleSignOut}
            fullWidth
            accessibilityLabel="Sign out of your account"
            accessibilityHint="Tap to sign out of your recovery companion account"
          />
        </View>

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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  program: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  streak: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingEmoji: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingArrow: {
    fontSize: 20,
    color: '#9ca3af',
    marginLeft: 8,
  },
  signOutSection: {
    marginBottom: 24,
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