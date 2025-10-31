import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '@repo/ui';
import { trpc } from '../../../lib/trpc';
import { simulateGeofenceTrigger } from '../../../lib/geofenceSimulator';

export default function TriggersScreen() {
  const router = useRouter();
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);

  const { data: triggerLocations, isLoading, refetch } = trpc.triggers.getAll.useQuery();
  const { data: actionPlans } = trpc.plans.getAll.useQuery();

  const deleteTrigger = trpc.triggers.delete.useMutation();
  const toggleTrigger = trpc.triggers.toggle.useMutation();

  const handleCreateTrigger = () => {
    router.push('/(tabs)/me/triggers/create');
  };

  const handleEditTrigger = (triggerId: string) => {
    router.push(`/(tabs)/me/triggers/${triggerId}`);
  };

  const handleDeleteTrigger = (triggerId: string, triggerLabel: string) => {
    Alert.alert(
      'Delete Trigger Location',
      `Are you sure you want to delete "${triggerLabel}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrigger.mutateAsync({ id: triggerId });
              await refetch();
            } catch (error) {
              console.error('Delete trigger error:', error);
              Alert.alert('Error', 'Unable to delete the trigger location.');
            }
          },
        },
      ]
    );
  };

  const handleToggleTrigger = async (triggerId: string, currentActive: boolean) => {
    try {
      await toggleTrigger.mutateAsync({ id: triggerId, active: !currentActive });
      await refetch();
    } catch (error) {
      console.error('Toggle trigger error:', error);
      Alert.alert('Error', 'Unable to update trigger status.');
    }
  };

  const handleTestEnter = async (triggerId: string, triggerLabel: string) => {
    try {
      const event = await simulateGeofenceTrigger(triggerId, 'enter');
      if (event) {
        Alert.alert(
          'Test Enter Triggered',
          `Simulated entering "${triggerLabel}". Check your notifications and action plans.`,
          [{ text: 'OK' }]
        );
        await refetch();
      } else {
        Alert.alert('Error', 'Failed to simulate geofence trigger.');
      }
    } catch (error) {
      console.error('Test enter error:', error);
      Alert.alert('Error', 'Unable to simulate geofence trigger.');
    }
  };

  const handleTestExit = async (triggerId: string, triggerLabel: string) => {
    try {
      const event = await simulateGeofenceTrigger(triggerId, 'exit');
      if (event) {
        Alert.alert(
          'Test Exit Triggered',
          `Simulated exiting "${triggerLabel}". Check your notifications.`,
          [{ text: 'OK' }]
        );
        await refetch();
      } else {
        Alert.alert('Error', 'Failed to simulate geofence trigger.');
      }
    } catch (error) {
      console.error('Test exit error:', error);
      Alert.alert('Error', 'Unable to simulate geofence trigger.');
    }
  };

  const getActionPlanName = (actionPlanId: string) => {
    const plan = actionPlans?.find(p => p.id === actionPlanId);
    return plan?.title || 'Unknown Plan';
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
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
          <Text style={styles.title}>Trigger Locations</Text>
          <Text style={styles.subtitle}>
            Set up location-based triggers for your action plans
          </Text>
        </View>

        {triggerLocations && triggerLocations.length > 0 ? (
          <View style={styles.triggersList}>
            {triggerLocations.map((trigger) => (
              <TouchableOpacity
                key={trigger.id}
                style={styles.triggerCard}
                onPress={() => setSelectedTrigger(selectedTrigger === trigger.id ? null : trigger.id)}
                accessibilityLabel={`Trigger location: ${trigger.label}`}
                accessibilityHint="Tap to expand or collapse trigger details"
              >
                <View style={styles.triggerHeader}>
                  <View style={styles.triggerInfo}>
                    <Text style={styles.triggerLabel}>{trigger.label}</Text>
                    <Text style={styles.triggerLocation}>
                      {formatCoordinates(trigger.lat, trigger.lng)}
                    </Text>
                    <Text style={styles.triggerRadius}>
                      Radius: {trigger.radius_m}m
                    </Text>
                  </View>
                  <View style={styles.triggerStatus}>
                    <TouchableOpacity
                      style={[
                        styles.statusToggle,
                        trigger.active && styles.statusToggleActive
                      ]}
                      onPress={() => handleToggleTrigger(trigger.id, trigger.active)}
                      accessibilityLabel={trigger.active ? 'Disable trigger' : 'Enable trigger'}
                      accessibilityHint="Toggle trigger location on or off"
                    >
                      <Text style={[
                        styles.statusText,
                        trigger.active && styles.statusTextActive
                      ]}>
                        {trigger.active ? 'ON' : 'OFF'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {selectedTrigger === trigger.id && (
                  <View style={styles.triggerDetails}>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailTitle}>Action Plan</Text>
                      <Text style={styles.detailText}>
                        {getActionPlanName(trigger.action_plan_id)}
                      </Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailTitle}>On Enter Actions</Text>
                      {trigger.on_enter && trigger.on_enter.length > 0 ? (
                        trigger.on_enter.map((action, index) => (
                          <Text key={index} style={styles.actionText}>
                            • {action}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.noActionsText}>No enter actions set</Text>
                      )}
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailTitle}>On Exit Actions</Text>
                      {trigger.on_exit && trigger.on_exit.length > 0 ? (
                        trigger.on_exit.map((action, index) => (
                          <Text key={index} style={styles.actionText}>
                            • {action}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.noActionsText}>No exit actions set</Text>
                      )}
                    </View>

                    <View style={styles.triggerActions}>
                      <ActionButton
                        title="Edit"
                        variant="secondary"
                        size="small"
                        onPress={() => handleEditTrigger(trigger.id)}
                        accessibilityLabel={`Edit ${trigger.label}`}
                      />
                      <ActionButton
                        title="Delete"
                        variant="danger"
                        size="small"
                        onPress={() => handleDeleteTrigger(trigger.id, trigger.label)}
                        accessibilityLabel={`Delete ${trigger.label}`}
                      />
                    </View>

                    <View style={styles.testSection}>
                      <Text style={styles.testTitle}>Test Geofence</Text>
                      <Text style={styles.testDescription}>
                        Simulate entering or exiting this trigger location to test your action plans.
                      </Text>
                      <View style={styles.testButtons}>
                        <ActionButton
                          title="Test Enter"
                          variant="primary"
                          size="small"
                          onPress={() => handleTestEnter(trigger.id, trigger.label)}
                          accessibilityLabel={`Test entering ${trigger.label}`}
                        />
                        <ActionButton
                          title="Test Exit"
                          variant="secondary"
                          size="small"
                          onPress={() => handleTestExit(trigger.id, trigger.label)}
                          accessibilityLabel={`Test exiting ${trigger.label}`}
                        />
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Trigger Locations Yet</Text>
            <Text style={styles.emptyText}>
              Create your first trigger location to automatically activate action plans when you enter specific areas.
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <ActionButton
            title="Create New Trigger"
            onPress={handleCreateTrigger}
            fullWidth
            accessibilityLabel="Create new trigger location"
            accessibilityHint="Tap to create a new location-based trigger"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Trigger locations use your device's GPS to automatically activate action plans when you enter or exit specific areas.
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
  triggersList: {
    marginBottom: 24,
  },
  triggerCard: {
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
  triggerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  triggerInfo: {
    flex: 1,
    marginRight: 12,
  },
  triggerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  triggerLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  triggerRadius: {
    fontSize: 14,
    color: '#6b7280',
  },
  triggerStatus: {
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
  triggerDetails: {
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
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  noActionsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  triggerActions: {
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
  testSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  testButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});
