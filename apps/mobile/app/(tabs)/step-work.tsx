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
import { trpc } from '../../lib/trpc';
import { format } from 'date-fns';

export default function StepWorkScreen() {
  const router = useRouter();
  
  const { data: steps, isLoading, refetch } = trpc.steps.getAll.useQuery();
  const { data: stepEntries } = trpc.steps.getUserEntries.useQuery();

  const getStepProgress = (stepId: string) => {
    if (!stepEntries) return 0;
    const entries = stepEntries.filter(entry => entry.step_id === stepId);
    return entries.length;
  };

  const getLatestEntry = (stepId: string) => {
    if (!stepEntries) return null;
    const entries = stepEntries
      .filter(entry => entry.step_id === stepId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return entries[0] || null;
  };

  const handleStepPress = (stepId: string) => {
    router.push(`/(tabs)/step-work/${stepId}`);
  };

  const getStepStatus = (step: any) => {
    const progress = getStepProgress(step.id);
    const latestEntry = getLatestEntry(step.id);
    
    if (progress === 0) return 'not-started';
    if (progress === 1) return 'in-progress';
    return 'completed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#059669';
      case 'in-progress': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>12-Step Work</Text>
          <Text style={styles.subtitle}>
            Work through the steps at your own pace
          </Text>
        </View>

        {steps?.map((step) => {
          const status = getStepStatus(step);
          const progress = getStepProgress(step.id);
          const latestEntry = getLatestEntry(step.id);
          
          return (
            <TouchableOpacity
              key={step.id}
              style={styles.stepCard}
              onPress={() => handleStepPress(step.id)}
              accessibilityLabel={`Step ${step.step_number}: ${step.title}`}
              accessibilityHint={`Tap to ${status === 'not-started' ? 'start' : 'continue'} working on this step`}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.step_number}</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepProgram}>{step.program}</Text>
                </View>
                <View style={styles.stepStatus}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(status) }
                    ]}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                    {getStatusText(status)}
                  </Text>
                </View>
              </View>

              {progress > 0 && (
                <View style={styles.stepProgress}>
                  <Text style={styles.progressText}>
                    {progress} {progress === 1 ? 'entry' : 'entries'}
                  </Text>
                  {latestEntry && (
                    <Text style={styles.lastEntryText}>
                      Last updated: {format(new Date(latestEntry.created_at), 'MMM d, yyyy')}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.stepActions}>
                <ActionButton
                  title={status === 'not-started' ? 'Start Step' : 'Continue'}
                  variant={status === 'completed' ? 'secondary' : 'primary'}
                  size="small"
                  onPress={() => handleStepPress(step.id)}
                  accessibilityLabel={`${status === 'not-started' ? 'Start' : 'Continue'} step ${step.step_number}`}
                />
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Remember: There's no right or wrong pace for working the steps. 
            Take your time and be honest with yourself.
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
  stepCard: {
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
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  stepProgram: {
    fontSize: 14,
    color: '#6b7280',
  },
  stepStatus: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stepProgress: {
    marginBottom: 16,
    paddingLeft: 52,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  lastEntryText: {
    fontSize: 12,
    color: '#6b7280',
  },
  stepActions: {
    paddingLeft: 52,
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  footerText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});