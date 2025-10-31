import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '@repo/ui';
import { trpc } from '../../lib/trpc';
import { format } from 'date-fns';

export default function PlansScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: actionPlans, isLoading, refetch } = trpc.plans.getAll.useQuery();
  const { data: triggerLocations } = trpc.triggers.getAll.useQuery();

  const deletePlan = trpc.plans.delete.useMutation();

  const handleCreatePlan = () => {
    router.push('/(tabs)/plans/create');
  };

  const handleEditPlan = (planId: string) => {
    router.push(`/(tabs)/plans/${planId}`);
  };

  const handleDeletePlan = (planId: string, planTitle: string) => {
    Alert.alert(
      'Delete Action Plan',
      `Are you sure you want to delete "${planTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlan.mutateAsync({ id: planId });
              await refetch();
            } catch (error) {
              console.error('Delete plan error:', error);
              Alert.alert('Error', 'Unable to delete the action plan.');
            }
          },
        },
      ]
    );
  };

  const getPlanStatus = (plan: any) => {
    const hasTriggers = triggerLocations?.some(
      trigger => trigger.action_plan_id === plan.id
    );
    return hasTriggers ? 'active' : 'inactive';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#059669' : '#6b7280';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Active' : 'Inactive';
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
          <Text style={styles.title}>Action Plans</Text>
          <Text style={styles.subtitle}>
            Create plans for specific situations and locations
          </Text>
        </View>

        {actionPlans && actionPlans.length > 0 ? (
          <View style={styles.plansList}>
            {actionPlans.map((plan) => {
              const status = getPlanStatus(plan);
              
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.planCard}
                  onPress={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
                  accessibilityLabel={`Action plan: ${plan.title}`}
                  accessibilityHint="Tap to expand or collapse plan details"
                >
                  <View style={styles.planHeader}>
                    <View style={styles.planInfo}>
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      <Text style={styles.planSituation}>{plan.situation}</Text>
                    </View>
                    <View style={styles.planStatus}>
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

                  {selectedPlan === plan.id && (
                    <View style={styles.planDetails}>
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>If-Then Actions</Text>
                        {plan.if_then?.map((item, index) => (
                          <View key={index} style={styles.ifThenItem}>
                            <Text style={styles.ifText}>
                              <Text style={styles.ifLabel}>If:</Text> {item.if}
                            </Text>
                            <Text style={styles.thenText}>
                              <Text style={styles.thenLabel}>Then:</Text> {item.then}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {plan.checklist && plan.checklist.length > 0 && (
                        <View style={styles.section}>
                          <Text style={styles.sectionTitle}>Checklist</Text>
                          {plan.checklist.map((item, index) => (
                            <View key={index} style={styles.checklistItem}>
                              <Text style={styles.checklistText}>• {item}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {plan.emergency_contacts && plan.emergency_contacts.length > 0 && (
                        <View style={styles.section}>
                          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                          {plan.emergency_contacts.map((contact, index) => (
                            <View key={index} style={styles.contactItem}>
                              <Text style={styles.contactName}>{contact.name}</Text>
                              <Text style={styles.contactPhone}>{contact.phone}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <View style={styles.planActions}>
                        <ActionButton
                          title="Edit"
                          variant="secondary"
                          size="small"
                          onPress={() => handleEditPlan(plan.id)}
                          accessibilityLabel={`Edit ${plan.title}`}
                        />
                        <ActionButton
                          title="Delete"
                          variant="danger"
                          size="small"
                          onPress={() => handleDeletePlan(plan.id, plan.title)}
                          accessibilityLabel={`Delete ${plan.title}`}
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
            <Text style={styles.emptyTitle}>No Action Plans Yet</Text>
            <Text style={styles.emptyText}>
              Create your first action plan to help you navigate challenging situations.
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <ActionButton
            title="Create New Plan"
            onPress={handleCreatePlan}
            fullWidth
            accessibilityLabel="Create new action plan"
            accessibilityHint="Tap to create a new action plan for specific situations"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Action plans help you prepare for challenging situations. 
            They can be triggered by location or activated manually.
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
  plansList: {
    marginBottom: 24,
  },
  planCard: {
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
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  planSituation: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  planStatus: {
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
  planDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  ifThenItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  ifText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  ifLabel: {
    fontWeight: '600',
    color: '#dc2626',
  },
  thenText: {
    fontSize: 14,
    color: '#374151',
  },
  thenLabel: {
    fontWeight: '600',
    color: '#059669',
  },
  checklistItem: {
    marginBottom: 4,
  },
  checklistText: {
    fontSize: 14,
    color: '#374151',
  },
  contactItem: {
    marginBottom: 8,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  contactPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  planActions: {
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