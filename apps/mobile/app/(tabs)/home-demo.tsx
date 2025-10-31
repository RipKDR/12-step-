import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '@repo/ui';
import {
  mockProfile,
  mockSobrietyStats,
  mockDailyEntries,
  mockRoutines,
} from '../../lib/mockData';
import { format } from 'date-fns';

export default function HomeDemoScreen() {
  const router = useRouter();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'daily':
        router.push('/(tabs)/daily');
        break;
      case 'step-work':
        router.push('/(tabs)/step-work');
        break;
      case 'plans':
        router.push('/(tabs)/plans');
        break;
      case 'support':
        router.push('/(tabs)/me/support');
        break;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatSobrietyTime = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return remainingDays > 0 ? `${months}m ${remainingDays}d` : `${months} month${months > 1 ? 's' : ''}`;
    }
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    const months = Math.floor(remainingDays / 30);
    return months > 0 ? `${years}y ${months}m` : `${years} year${years > 1 ? 's' : ''}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}, {mockProfile.handle}
          </Text>
          <Text style={styles.subtitle}>
            {mockProfile.program} • {format(new Date(), 'MMM d, yyyy')}
          </Text>
        </View>

        {/* Sobriety Counter */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sobriety Streak</Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakNumber}>
              {mockSobrietyStats.currentStreakDays}
            </Text>
            <Text style={styles.streakLabel}>
              {formatSobrietyTime(mockSobrietyStats.currentStreakDays)}
            </Text>
          </View>
          {mockSobrietyStats.milestone && (
            <Text style={styles.milestone}>
              🎉 {mockSobrietyStats.milestone}
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('daily')}
              accessibilityLabel="Log daily entry"
              accessibilityHint="Tap to record your daily recovery progress"
            >
              <Text style={styles.actionEmoji}>📝</Text>
              <Text style={styles.actionText}>Daily Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('step-work')}
              accessibilityLabel="Work on steps"
              accessibilityHint="Tap to continue your 12-step work"
            >
              <Text style={styles.actionEmoji}>📖</Text>
              <Text style={styles.actionText}>Step Work</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('plans')}
              accessibilityLabel="View action plans"
              accessibilityHint="Tap to manage your action plans"
            >
              <Text style={styles.actionEmoji}>📋</Text>
              <Text style={styles.actionText}>Action Plans</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('support')}
              accessibilityLabel="Get support"
              accessibilityHint="Tap to access support tools and resources"
            >
              <Text style={styles.actionEmoji}>🤝</Text>
              <Text style={styles.actionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        {mockDailyEntries && mockDailyEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.card}>
              {mockDailyEntries.map((entry, index) => (
                <View key={entry.id} style={styles.activityItem}>
                  <Text style={styles.activityDate}>
                    {format(new Date(entry.entry_date), 'MMM d')}
                  </Text>
                  <Text style={styles.activityText}>
                    Daily entry • Cravings: {entry.cravings_intensity}/10
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upcoming Routines */}
        {mockRoutines && mockRoutines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Routines</Text>
            <View style={styles.card}>
              {mockRoutines.map((routine) => (
                <View key={routine.id} style={styles.routineItem}>
                  <Text style={styles.routineTitle}>{routine.title}</Text>
                  <Text style={styles.routineTime}>
                    {routine.schedule?.hour}:{routine.schedule?.minute?.toString().padStart(2, '0') || '00'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Emergency Support */}
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>Need Help Now?</Text>
          <Text style={styles.emergencyText}>
            If you're experiencing a craving or need immediate support, tap below.
          </Text>
          <ActionButton
            title="Open Support Card"
            variant="danger"
            onPress={() => handleQuickAction('support')}
            fullWidth
            accessibilityLabel="Open support card for immediate help"
            accessibilityHint="Tap to access emergency support tools and resources"
          />
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Text style={styles.demoTitle}>🎭 Demo Mode</Text>
          <Text style={styles.demoText}>
            This is a preview of the 12-Step Recovery Companion app. 
            In the full version, you'll be able to:
          </Text>
          <Text style={styles.demoList}>
            • Log daily recovery progress{'\n'}
            • Work through 12-step programs (NA/AA){'\n'}
            • Create action plans and routines{'\n'}
            • Connect with sponsors{'\n'}
            • Find nearby meetings{'\n'}
            • Export your data anytime
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  streakLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  milestone: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 88,
    justifyContent: 'center',
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityDate: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    marginLeft: 12,
  },
  routineItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  routineTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  emergencyCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 16,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  demoText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 12,
    lineHeight: 20,
  },
  demoList: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 22,
  },
});
