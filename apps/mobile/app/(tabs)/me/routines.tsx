import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '@repo/ui';
import { trpc } from '../../../lib/trpc';
import { format } from 'date-fns';

export default function RoutinesScreen() {
  const router = useRouter();
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);

  const { data: routines, isLoading, refetch } = trpc.routines.getAll.useQuery();
  const { data: routineLogs } = trpc.routines.getLogs.useQuery();

  const deleteRoutine = trpc.routines.delete.useMutation();
  const toggleRoutine = trpc.routines.toggle.useMutation();

  const handleCreateRoutine = () => {
    router.push('/(tabs)/me/routines/create');
  };

  const handleEditRoutine = (routineId: string) => {
    router.push(`/(tabs)/me/routines/${routineId}`);
  };

  const handleDeleteRoutine = (routineId: string, routineTitle: string) => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routineTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoutine.mutateAsync({ id: routineId });
              await refetch();
            } catch (error) {
              console.error('Delete routine error:', error);
              Alert.alert('Error', 'Unable to delete the routine.');
            }
          },
        },
      ]
    );
  };

  const handleToggleRoutine = async (routineId: string, currentActive: boolean) => {
    try {
      await toggleRoutine.mutateAsync({ id: routineId, active: !currentActive });
      await refetch();
    } catch (error) {
      console.error('Toggle routine error:', error);
      Alert.alert('Error', 'Unable to update routine status.');
    }
  };

  const getRoutineCompletionRate = (routineId: string) => {
    if (!routineLogs) return 0;
    const logs = routineLogs.filter(log => log.routine_id === routineId);
    const completed = logs.filter(log => log.status === 'completed').length;
    return logs.length > 0 ? Math.round((completed / logs.length) * 100) : 0;
  };

  const getScheduleText = (schedule: any) => {
    if (!schedule) return 'No schedule set';
    
    if (schedule.type === 'daily') {
      return `Daily at ${schedule.time || 'No time set'}`;
    } else if (schedule.type === 'weekly') {
      const days = schedule.days?.join(', ') || 'No days set';
      return `Weekly on ${days}`;
    }
    
    return 'Custom schedule';
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
          <Text style={styles.title}>Routines</Text>
          <Text style={styles.subtitle}>
            Set up daily and weekly recovery routines
          </Text>
        </View>

        {routines && routines.length > 0 ? (
          <View style={styles.routinesList}>
            {routines.map((routine) => {
              const completionRate = getRoutineCompletionRate(routine.id);
              
              return (
                <TouchableOpacity
                  key={routine.id}
                  style={styles.routineCard}
                  onPress={() => setSelectedRoutine(selectedRoutine === routine.id ? null : routine.id)}
                  accessibilityLabel={`Routine: ${routine.title}`}
                  accessibilityHint="Tap to expand or collapse routine details"
                >
                  <View style={styles.routineHeader}>
                    <View style={styles.routineInfo}>
                      <Text style={styles.routineTitle}>{routine.title}</Text>
                      <Text style={styles.routineSchedule}>
                        {getScheduleText(routine.schedule)}
                      </Text>
                    </View>
                    <View style={styles.routineStatus}>
                      <TouchableOpacity
                        style={[
                          styles.statusToggle,
                          routine.active && styles.statusToggleActive
                        ]}
                        onPress={() => handleToggleRoutine(routine.id, routine.active)}
                        accessibilityLabel={routine.active ? 'Disable routine' : 'Enable routine'}
                        accessibilityHint="Toggle routine on or off"
                      >
                        <Text style={[
                          styles.statusText,
                          routine.active && styles.statusTextActive
                        ]}>
                          {routine.active ? 'ON' : 'OFF'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {routine.active && (
                    <View style={styles.completionBar}>
                      <Text style={styles.completionLabel}>Completion Rate</Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${completionRate}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.completionText}>{completionRate}%</Text>
                    </View>
                  )}

                  {selectedRoutine === routine.id && (
                    <View style={styles.routineDetails}>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailTitle}>Schedule</Text>
                        <Text style={styles.detailText}>
                          {getScheduleText(routine.schedule)}
                        </Text>
                      </View>

                      {routine.description && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailTitle}>Description</Text>
                          <Text style={styles.detailText}>{routine.description}</Text>
                        </View>
                      )}

                      <View style={styles.routineActions}>
                        <ActionButton
                          title="Edit"
                          variant="secondary"
                          size="small"
                          onPress={() => handleEditRoutine(routine.id)}
                          accessibilityLabel={`Edit ${routine.title}`}
                        />
                        <ActionButton
                          title="Delete"
                          variant="danger"
                          size="small"
                          onPress={() => handleDeleteRoutine(routine.id, routine.title)}
                          accessibilityLabel={`Delete ${routine.title}`}
                        />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Routines Yet</Text>
            <Text style={styles.emptyText}>
              Create your first routine to build consistent recovery habits.
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <ActionButton
            title="Create New Routine"
            onPress={handleCreateRoutine}
            fullWidth
            accessibilityLabel="Create new routine"
            accessibilityHint="Tap to create a new recovery routine"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Routines help you build consistent recovery habits. 
            You'll receive notifications when it's time to complete them.
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
  routinesList: {
    marginBottom: 24,
  },
  routineCard: {
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
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routineInfo: {
    flex: 1,
    marginRight: 12,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  routineSchedule: {
    fontSize: 14,
    color: '#6b7280',
  },
  routineStatus: {
    alignItems: 'center',
  },
  statusToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  statusToggleActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusTextActive: {
    color: '#ffffff',
  },
  completionBar: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  completionLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  completionText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  routineDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailSection: {
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  routineActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    marginBottom: 24,
  },
  footer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
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
